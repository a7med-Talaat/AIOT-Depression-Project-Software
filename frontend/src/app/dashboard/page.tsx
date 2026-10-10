'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { RiskMeter } from '../../components/dashboard/RiskMeter';
import { Activity, Heart, Wind, AlertCircle } from 'lucide-react';
import { useSensorStore } from '../../store/sensorStore';
import api from '../../lib/api';
import { DashboardSummary } from '../../types';

export default function Dashboard() {
  const latestReading = useSensorStore(state => state.latestReading);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const currentHR = latestReading?.heartRate || summary?.latestHeartRate || 0;
  const currentSpO2 = latestReading?.spO2 || summary?.latestSpO2 || 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>System Online • Live Monitoring</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard title="Latest Heart Rate" value={`${currentHR} bpm`} icon={Heart} color="red" trend="neutral" trendValue="Normal" />
          <SummaryCard title="Latest SpO2" value={`${currentSpO2}%`} icon={Wind} color="blue" />
          <SummaryCard title="Activity Level" value={summary?.activityLevel || 'Normal'} icon={Activity} color="purple" />
          <SummaryCard title="Active Alerts" value={summary?.activeAlerts || 0} icon={AlertCircle} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-900 w-full mb-4">Current Risk Assessment</h2>
            <RiskMeter score={summary?.currentRiskScore || 0} level={summary?.riskLevel || 'LOW'} />
            <p className="text-sm text-gray-500 text-center mt-4 px-4">
              Risk level is calculated based on recent physiological data and behavioral patterns.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions & Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-brand-bg rounded-lg border border-gray-200">
                 <h3 className="font-medium text-gray-900">Sensor Status</h3>
                 <p className="text-sm text-gray-500 mt-1">All sensors connected and transmitting data.</p>
               </div>
               <div className="p-4 bg-brand-bg rounded-lg border border-gray-200">
                 <h3 className="font-medium text-gray-900">Next Scheduled Assessment</h3>
                 <p className="text-sm text-gray-500 mt-1">Today at 18:00 PM</p>
               </div>
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 sm:col-span-2">
                 <h3 className="font-medium text-blue-900">AI Recommendation</h3>
                 <p className="text-sm text-blue-700 mt-1">Patient shows stable vitals today. Maintain current monitoring schedule.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
