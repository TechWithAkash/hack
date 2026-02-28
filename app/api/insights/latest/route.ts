import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RiskEvent } from '@/lib/models/RiskEvent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level');

    const filter: Record<string, unknown> = {};
    if (level) filter.riskLevel = level.toUpperCase();
    const method = searchParams.get('method');
    if (method) filter.detectionMethod = method.toUpperCase();

    const events = await RiskEvent
        .find(filter)
        .populate('districtId', 'districtName stateName areaKm2 population2020')
        .populate('sceneId', 'source sceneDate geeAssetId')
        .sort({ eventDate: -1, detectedAt: -1 })
        .limit(limit)
        .lean();

    const breakdown = await RiskEvent.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 }, totalFloodArea: { $sum: '$floodAreaKm2' }, totalAffectedPop: { $sum: '$affectedPopEst' } } },
    ]);

    return NextResponse.json({ generatedAt: new Date().toISOString(), totalEvents: events.length, events, breakdown });
}
