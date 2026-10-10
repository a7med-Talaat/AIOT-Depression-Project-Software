import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const Recommendations = ({ recommendations }: { recommendations: string[] }) => {
  if (!recommendations || recommendations.length === 0) return <p className="text-sm text-gray-500">No recommendations available.</p>;

  return (
    <ul className="space-y-3">
      {recommendations.map((rec, idx) => (
        <li key={idx} className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            {rec.toLowerCase().includes('immediate') || rec.toLowerCase().includes('critical') ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-brand-light" />
            )}
          </div>
          <p className="ml-3 text-sm text-gray-700">{rec}</p>
        </li>
      ))}
    </ul>
  );
};
