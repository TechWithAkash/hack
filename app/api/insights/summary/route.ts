import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RiskEvent } from '@/lib/models/RiskEvent';
import { District } from '@/lib/models/District';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Force evaluation of District schema so mongoose registers it
        if (!District) throw new Error("District model failed to load");

        const [riskBreakdown, trendData, topDistricts] = await Promise.all([
            RiskEvent.aggregate([
                { $sort: { eventDate: -1 } },
                { $group: { _id: '$districtId', latest: { $first: '$$ROOT' } } },
                { $group: { _id: '$latest.riskLevel', count: { $sum: 1 } } },
            ]),
            RiskEvent.aggregate([
                { $match: { eventDate: { $gte: new Date(Date.now() - 30 * 86400000) } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventDate' } },
                        avgRiskScore: { $avg: '$riskScore' },
                        totalFloodAreaKm2: { $sum: '$floodAreaKm2' },
                        totalAffectedPop: { $sum: '$affectedPopEst' },
                        criticalCount: { $sum: { $cond: [{ $eq: ['$riskLevel', 'CRITICAL'] }, 1, 0] } },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            RiskEvent.find({ riskLevel: { $in: ['CRITICAL', 'HIGH'] }, status: 'active' })
                .populate('districtId', 'districtName stateName')
                .sort({ riskScore: -1 })
                .limit(5)
                .lean(),
        ]);

        const totalFloodArea = await RiskEvent.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$floodAreaKm2' }, totalPop: { $sum: '$affectedPopEst' } } },
        ]);

        return NextResponse.json({
            riskBreakdown,
            trendData,
            topDistricts,
            totals: totalFloodArea[0] || { total: 0, totalPop: 0 },
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
