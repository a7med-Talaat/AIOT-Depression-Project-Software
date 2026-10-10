import React from 'react';

interface Factor {
  factor: string;
  contribution: number;
}

export const KeyFactors = ({ factors }: { factors: Factor[] }) => {
  if (!factors || factors.length === 0) return <p className="text-sm text-gray-500">No factors identified.</p>;

  // Sort by absolute contribution
  const sortedFactors = [...factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className="space-y-4">
      {sortedFactors.map((item, idx) => {
        const isPositive = item.contribution > 0;
        const width = Math.min(Math.abs(item.contribution) * 100, 100);
        
        return (
          <div key={idx} className="relative">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{item.factor.replace(/_/g, ' ')}</span>
              <span className={isPositive ? 'text-red-500' : 'text-green-500'}>
                {isPositive ? '+' : ''}{item.contribution.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${width}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
