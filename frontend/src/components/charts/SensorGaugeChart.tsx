import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

interface Props {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

export const SensorGaugeChart = ({ value, min, max, label, unit, color }: Props) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  
  const data = {
    labels: [label, 'Empty'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#f1f5f9'],
        borderWidth: 0,
        cutout: '75%',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  return (
    <div className="relative h-32 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{value.toFixed(1)}</span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );
};
