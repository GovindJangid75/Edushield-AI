import React from 'react';

interface CustomSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function CustomSparkline({ 
  data, 
  color = '#C75B39', 
  width = 300, 
  height = 80 
}: CustomSparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 10;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  // Generate points
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    // Invert Y axis for SVG rendering
    const y = padding + chartHeight - ((val - min) / range) * chartHeight;
    return { x, y, value: val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill path for background gradient
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Muted grid horizontal guidelines */}
        <line x1={0} y1={padding} x2={width} y2={padding} stroke="#E8DDD0" strokeDasharray="3,3" strokeWidth="1" />
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#E8DDD0" strokeDasharray="3,3" strokeWidth="1" />
        <line x1={0} y1={height - padding} x2={width} y2={height - padding} stroke="#E8DDD0" strokeDasharray="3,3" strokeWidth="1" />

        {/* Gradient fill */}
        <path d={fillD} fill={`url(#grad-${color})`} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Start, Middle, End dot indicators */}
        {points.map((p, idx) => {
          const isSelected = idx === 0 || idx === points.length - 1 || p.value === max || p.value === min;
          if (!isSelected) return null;
          return (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
              <text 
                x={p.x} 
                y={p.y - 8} 
                fontSize="9" 
                fontFamily="var(--font-mono)" 
                fontWeight="bold" 
                fill="#1A1A2E"
                textAnchor="middle"
              >
                {p.value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
