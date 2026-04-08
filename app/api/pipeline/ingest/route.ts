import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RiskEvent } from '@/lib/models/RiskEvent';
import { District } from '@/lib/models/District';
import { SatelliteScene } from '@/lib/models/SatelliteScene';
import { ProcessingLog } from '@/lib/models/ProcessingLog';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('x-pipeline-secret');
    if (authHeader !== process.env.PIPELINE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const payload = await req.json();

        const scene = await SatelliteScene.findOneAndUpdate(
            { geeAssetId: payload.scene.geeAssetId },
            { ...payload.scene, status: 'processed' },
            { upsert: true, returnDocument: 'after' }
        );

        const eventIds: string[] = [];

        for (const result of payload.districtResults) {
            
            // Sanitize payload enums to strictly match Mongoose schema expected arrays
            let sanitizedRiskLevel = result.riskLevel;
            if (sanitizedRiskLevel === 'MINIMAL') sanitizedRiskLevel = 'LOW';
            
            let sanitizedMethod = result.detectionMethod;
            if (sanitizedMethod === 'ENSEMBLE_STREAMLIT') sanitizedMethod = 'ENSEMBLE';

            const district = await District.findOneAndUpdate(
                { districtName: result.districtName, stateName: result.stateName },
                { currentRiskLevel: sanitizedRiskLevel, lastAssessedAt: new Date(), $inc: { totalEventsCount: 1 } },
                { upsert: true, new: true, returnDocument: 'after' }
            );

            const event = await RiskEvent.create({
                districtId: district._id,
                sceneId: scene._id,
                eventDate: new Date(payload.eventDate),
                riskLevel: sanitizedRiskLevel,
                riskScore: result.riskScore,
                floodAreaKm2: result.floodAreaKm2,
                floodPctDistrict: result.floodPctDistrict,
                affectedPopEst: result.affectedPopEst,
                confidenceScore: result.confidenceScore,
                detectionMethod: sanitizedMethod,
                changeFromPrevKm2: result.changeFromPrevKm2,
                floodGeometry: result.floodGeometry,
                enrichment: result.enrichment,
                metadata: result.metadata ?? {},   // ← SAR ΔdB, NDWI, windows
                status: result.status ?? 'active',
            });

            eventIds.push(event._id.toString());
        }

        if (payload.logs?.length > 0) {
            await ProcessingLog.insertMany(
                payload.logs.map((log: any) => ({ ...log, runId: payload.runId }))
            );
        }

        return NextResponse.json({ success: true, runId: payload.runId, eventsCreated: eventIds.length, eventIds });
    } catch (error) {
        console.error('Ingest error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
