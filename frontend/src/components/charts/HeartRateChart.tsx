import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { SensorReading } from '../../types';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export const HeartRateChart = ({ data }: { data: SensorReading[] }) => {
  const chartData = {
    labels: data.map(d => format(new Date(d.timestamp), 'HH:mm:ss')),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: data.map(d => d.heartRate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 10,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 50,
        max: 150,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 8
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return <div className="h-64"><Line data={chartData} options={options} /></div>;
};
