import { getRiskConfig } from '@/lib/utils/riskClassifier';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Props { level: string; }

export default function RiskBadge({ level }: Props) {
    const cfg = getRiskConfig(level);

    const dotColor: Record<string, string> = {
        CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E', UNKNOWN: '#94A3B8',
    };

    return (
        <span
            className="risk-badge"
            style={{
                color: cfg.color,
                borderColor: cfg.color + '50',
                background: cfg.color + '15',
            }}
        >
            <span
                style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: dotColor[level] ?? '#94A3B8',
                    flexShrink: 0,
                }}
            />
            {level}
        </span>
    );
}
