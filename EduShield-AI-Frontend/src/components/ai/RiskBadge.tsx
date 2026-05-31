import { RiskLevel } from '@/lib/data/students';
import { useTranslation } from '@/lib/LanguageContext';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export default function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const { t } = useTranslation();

  const styles: Record<RiskLevel, { bg: string; text: string; labelKey: 'riskCritical' | 'riskHigh' | 'riskModerate' | 'riskStable'; border: string }> = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200/60',
      labelKey: 'riskCritical'
    },
    high: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200/60',
      labelKey: 'riskHigh'
    },
    moderate: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
      labelKey: 'riskModerate'
    },
    stable: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200/60',
      labelKey: 'riskStable'
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
      {t(current.labelKey)}
    </span>
  );
}
