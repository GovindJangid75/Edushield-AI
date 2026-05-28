import { RiskLevel } from '@/lib/data/students';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export default function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const styles: Record<RiskLevel, { bg: string; text: string; label: string; border: string }> = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200/60',
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200/60',
      label: 'High Risk'
    },
    moderate: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
      label: 'Moderate'
    },
    stable: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200/60',
      label: 'Stable'
    }
  };

  const current = styles[level] || styles.stable;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'critical' ? 'bg-red-600 risk-pulse-critical' :
        level === 'high' ? 'bg-orange-500 risk-pulse-high' :
        level === 'moderate' ? 'bg-amber-500' : 'bg-green-600'
      }`} />
      {current.label}
    </span>
  );
}
