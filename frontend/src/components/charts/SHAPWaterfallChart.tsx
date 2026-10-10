import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export const SHAPWaterfallChart = ({ factors }: { factors: any[] }) => {
  if (!factors || factors.length === 0) return null;

  const sorted = [...factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 5);
  
  const data = {
    labels: sorted.map(f => f.factor.replace(/_/g, ' ')),
    datasets: [
      {
        data: sorted.map(f => f.contribution),
        backgroundColor: sorted.map(f => f.contribution > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'),
        borderColor: sorted.map(f => f.contribution > 0 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'),
        borderWidth: 1,
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  };

  return <div className="h-64"><Bar data={data} options={options} /></div>;
};
