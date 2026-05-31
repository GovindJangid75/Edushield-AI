import React from 'react';

interface ConfidenceScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceScore({ score, size = 'md' }: ConfidenceScoreProps) {
  const parsedScore = typeof score === 'number' ? score : parseFloat(score);
  const validScore = isNaN(parsedScore) || parsedScore === undefined || parsedScore === null ? 80 : parsedScore;

  const getColors = (val: number) => {
    if (val >= 85) return { stroke: 'stroke-[#4A7C59]', text: 'text-[#4A7C59]', bg: 'bg-[#F0FDF4]' };
    if (val >= 70) return { stroke: 'stroke-[#D4A843]', text: 'text-[#D4A843]', bg: 'bg-[#FFFBEB]' };
    return { stroke: 'stroke-[#C75B39]', text: 'text-[#C75B39]', bg: 'bg-[#FFF8F0]' };
  };

  const colors = getColors(validScore);
  
  const dimensions = {
    sm: { radius: 14, strokeWidth: 2.5, sizeClass: 'w-8 h-8', textClass: 'text-[9px]' },
    md: { radius: 18, strokeWidth: 3.5, sizeClass: 'w-11 h-11', textClass: 'text-[11px]' },
    lg: { radius: 24, strokeWidth: 4.5, sizeClass: 'w-14 h-14', textClass: 'text-[13px]' }
  };

  const { radius, strokeWidth, sizeClass, textClass } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  return (
    <div className="flex items-center gap-2" title={`AI Confidence: ${validScore}%`}>
      <div className={`relative flex items-center justify-center ${sizeClass}`}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            className="stroke-gray-100"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            className={`${colors.stroke} transition-all duration-500 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute font-mono font-bold ${colors.text} ${textClass}`}>
          {Math.round(validScore)}%
        </span>
      </div>
      {size !== 'sm' && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">AI Confidence</span>
          <span className="text-xs font-semibold text-[#1A1A2E]">High Precision</span>
        </div>
      )}
    </div>
  );
}
