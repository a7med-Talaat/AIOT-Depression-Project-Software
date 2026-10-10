'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { HeartRateChart } from '../../../components/charts/HeartRateChart';
import { SensorGaugeChart } from '../../../components/charts/SensorGaugeChart';
import { RecentReadings } from '../../../components/dashboard/RecentReadings';
import { useSensorStore } from '../../../store/sensorStore';
import api from '../../../lib/api';

export default function SensorsPage() {
  const { latestReading, readingsHistory, setReadingsHistory } = useSensorStore();

  useEffect(() => {
    const fetchHistory = async () => {
      if (readingsHistory.length === 0) {
        try {
          const response = await api.get('/sensors/readings?limit=50');
          setReadingsHistory(response.data);
        } catch (error) {
          console.error('Failed to fetch sensor history', error);
        }
      }
    };
    fetchHistory();
  }, [readingsHistory.length, setReadingsHistory]);

  const accLevel = latestReading ? 
    Math.abs(latestReading.accelerometerX) + Math.abs(latestReading.accelerometerY) + Math.abs(latestReading.accelerometerZ) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Sensor Data</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2 w-full">Heart Rate</h3>
            <SensorGaugeChart 
              value={latestReading?.heartRate || 0} min={40} max={160} 
              label="BPM" unit="bpm" color="#ef4444" 
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2 w-full">Blood Oxygen</h3>
            <SensorGaugeChart 
              value={latestReading?.spO2 || 0} min={90} max={100} 
              label="SpO2" unit="%" color="#3b82f6" 
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2 w-full">Activity Level</h3>
            <SensorGaugeChart 
              value={accLevel} min={0} max={5} 
              label="Acc" unit="g" color="#8b5cf6" 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate Trend (Live)</h2>
          <HeartRateChart data={readingsHistory} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings Log</h2>
          <RecentReadings readings={readingsHistory} />
        </div>
      </div>
    </DashboardLayout>
  );
}
