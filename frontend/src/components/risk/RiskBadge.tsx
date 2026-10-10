import React from 'react';

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const RiskBadge = ({ level }: { level: RiskLevel | string }) => {
  const colors = {
    LOW: 'bg-risk-low text-white',
    MODERATE: 'bg-risk-moderate text-white',
    HIGH: 'bg-risk-high text-white',
    CRITICAL: 'bg-risk-critical text-white'
  };

  const colorClass = colors[level as RiskLevel] || 'bg-gray-500 text-white';

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {level}
    </span>
  );
};
