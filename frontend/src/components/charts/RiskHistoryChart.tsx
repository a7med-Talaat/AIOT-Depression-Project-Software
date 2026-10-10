import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const RiskHistoryChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <p>No data</p>;

  const chartData = {
    labels: data.map(d => format(new Date(d.timestamp), 'MMM dd, HH:mm')),
    datasets: [
      {
        label: 'Risk Score',
        data: data.map(d => d.riskScore),
        borderColor: '#312e81',
        backgroundColor: '#312e81',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: data.map(d => {
          if (d.riskLevel === 'CRITICAL') return '#ef4444';
          if (d.riskLevel === 'HIGH') return '#f97316';
          if (d.riskLevel === 'MODERATE') return '#eab308';
          return '#22c55e';
        }),
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f3f4f6' }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <div className="h-72"><Line data={chartData} options={options} /></div>;
};
