import React from 'react';
import { riskDistribution } from '@/lib/data/students';

export default function RiskDistributionRing() {
  const { critical, high, moderate, stable } = riskDistribution;
  const total = critical + high + moderate + stable;

  const data = [
    { label: 'Critical', value: critical, percentage: (critical / total) * 100, color: 'bg-[#DC2626]', border: 'border-[#DC2626]', text: 'text-[#DC2626]' },
    { label: 'High Risk', value: high, percentage: (high / total) * 100, color: 'bg-[#EA580C]', border: 'border-[#EA580C]', text: 'text-[#EA580C]' },
    { label: 'Moderate', value: moderate, percentage: (moderate / total) * 100, color: 'bg-[#D4A843]', border: 'border-[#D4A843]', text: 'text-[#D4A843]' },
    { label: 'Stable', value: stable, percentage: (stable / total) * 100, color: 'bg-[#4A7C59]', border: 'border-[#4A7C59]', text: 'text-[#4A7C59]' },
  ];

  return (
    <div className="space-y-4">
      {/* Visual Stacked bar */}
      <div className="h-6 w-full rounded-full overflow-hidden flex bg-gray-100 border border-[#E8DDD0]">
        {data.map((item, idx) => (
          item.value > 0 && (
            <div
              key={idx}
              className={`${item.color} h-full transition-all`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.value} students (${Math.round(item.percentage)}%)`}
            />
          )
        ))}
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs font-semibold text-[#1A1A2E]">{item.label}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-bold text-[#1A1A2E]">{item.value}</p>
              <p className="text-[10px] text-[#6B7280]">{Math.round(item.percentage)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
