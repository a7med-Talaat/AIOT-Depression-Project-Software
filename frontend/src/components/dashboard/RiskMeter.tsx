import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskMeterProps {
  score: number;
  level: string;
}

export const RiskMeter = ({ score, level }: RiskMeterProps) => {
  // Normalize score between 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  let color = '#22c55e'; // LOW
  if (level === 'MODERATE') color = '#eab308';
  if (level === 'HIGH') color = '#f97316';
  if (level === 'CRITICAL') color = '#ef4444';

  const data = {
    labels: ['Risk', 'Safe'],
    datasets: [
      {
        data: [normalizedScore, 100 - normalizedScore],
        backgroundColor: [color, '#e2e8f0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-12">
        <span className="text-4xl font-bold text-gray-800">{normalizedScore.toFixed(0)}</span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1" style={{ color }}>
          {level}
        </span>
      </div>
    </div>
  );
};
