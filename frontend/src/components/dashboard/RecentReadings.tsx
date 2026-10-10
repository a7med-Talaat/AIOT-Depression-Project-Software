import React from 'react';
import { format } from 'date-fns';
import { SensorReading } from '../../types';

export const RecentReadings = ({ readings }: { readings: SensorReading[] }) => {
  if (!readings || readings.length === 0) {
    return <div className="text-center py-4 text-gray-500">No recent readings</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO2</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {readings.slice(-5).reverse().map((reading) => {
            const accTotal = Math.abs(reading.accelerometerX) + Math.abs(reading.accelerometerY) + Math.abs(reading.accelerometerZ);
            const isHighHR = reading.heartRate > 100;
            const isLowSpO2 = reading.spO2 < 95;

            return (
              <tr key={reading.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(reading.timestamp), 'HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${isHighHR ? 'text-red-600' : 'text-gray-900'}`}>
                    {reading.heartRate} bpm
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${isLowSpO2 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {reading.spO2}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {accTotal.toFixed(2)} g
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
