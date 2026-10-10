'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { AlertList } from '../../../components/alerts/AlertList';
import api from '../../../lib/api';
import { Alert } from '../../../types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark alert as read', error);
    }
  };

  const filteredAlerts = filter === 'UNREAD' ? alerts.filter(a => !a.isRead) : alerts;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-brand-light text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-brand-light text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading alerts...</div>
          ) : (
            <AlertList alerts={filteredAlerts} onMarkRead={handleMarkRead} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
