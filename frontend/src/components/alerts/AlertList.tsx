import React from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';
import { Alert } from '../../types';

interface AlertListProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
}

export const AlertList = ({ alerts, onMarkRead }: AlertListProps) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-200" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
        <p className="mt-1 text-sm text-gray-500">Everything is looking good.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {alerts.map((alert) => {
        let Icon = Info;
        let iconColor = 'text-blue-500';
        let bgColor = 'bg-blue-50';

        if (alert.severity === 'WARNING') {
          Icon = Bell;
          iconColor = 'text-orange-500';
          bgColor = 'bg-orange-50';
        } else if (alert.severity === 'CRITICAL') {
          Icon = AlertTriangle;
          iconColor = 'text-red-500';
          bgColor = 'bg-red-50';
        }

        return (
          <li key={alert.id} className={`p-4 transition-colors ${alert.isRead ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 p-2 rounded-full ${bgColor}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${alert.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')} • {alert.type}
                </p>
              </div>
              {!alert.isRead && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="flex-shrink-0 text-xs font-medium text-brand-light hover:text-brand-dark"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
