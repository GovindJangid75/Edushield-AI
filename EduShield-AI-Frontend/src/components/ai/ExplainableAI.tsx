import React from 'react';
import { Student } from '@/lib/data/students';
import { AlertCircle, HelpCircle, ArrowUpRight, TrendingDown } from 'lucide-react';
import ConfidenceScore from './ConfidenceScore';

interface ExplainableAIProps {
  student: Student;
}

export default function ExplainableAI({ student }: ExplainableAIProps) {
  const getRiskWeightColor = (weight: number) => {
    if (weight >= 0.25) return 'text-[#DC2626] bg-red-50 border-red-100';
    if (weight >= 0.15) return 'text-[#D4A843] bg-amber-50 border-amber-100';
    return 'text-[#4A7C59] bg-green-50 border-green-100';
  };

  return (
    <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E8DDD0] pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#C75B39]" />
          <div>
            <h4 className="font-semibold text-sm text-[#1A1A2E] font-[family-name:var(--font-heading)]">Explainable AI (XAI) Diagnosis</h4>
            <p className="text-[10px] text-[#6B7280]">Human-interpretable risk rationale • Model: XGBoost-v2</p>
          </div>
        </div>
        <ConfidenceScore score={student.confidenceScore} size="sm" />
      </div>

      {/* AI Explanation Text */}
      <div className="text-xs text-[#1A1A2E] leading-relaxed bg-white border border-[#E8DDD0] p-3.5 rounded-lg">
        <p className="font-medium text-[#C75B39] mb-1.5 flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          Primary Risk Signature Detected:
        </p>
        {student.aiExplanation}
      </div>

      {/* Feature Contributions */}
      <div className="space-y-2.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Pattern Influence Breakdown</span>
        <div className="grid gap-2">
          {student.riskFactors.map((factor, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2.5 bg-white border border-[#E8DDD0]/80 rounded-lg text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRiskWeightColor(factor.weight)}`}>
                  {Math.round(factor.weight * 100)}%
                </span>
                <div>
                  <p className="font-medium text-[#1A1A2E]">{factor.factor}</p>
                  <p className="text-[10px] text-[#6B7280]">{factor.description}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold capitalize ${
                factor.trend === 'declining' ? 'text-[#DC2626]' :
                factor.trend === 'improving' ? 'text-[#4A7C59]' : 'text-[#6B7280]'
              }`}>
                {factor.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Reason */}
      {student.predictedDisengagementDays && (
        <div className="p-3 bg-red-50/50 border border-red-100/60 rounded-lg flex gap-2">
          <HelpCircle className="w-4 h-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-red-900 leading-snug">
            <span className="font-bold">Dropout Prediction Window:</span> AI model projects a high likelihood of academic disengagement within <span className="font-bold text-[#DC2626]">{student.predictedDisengagementDays} days</span> if attendance patterns persist. Prioritize immediate family contact.
          </div>
        </div>
      )}
    </div>
  );
}
