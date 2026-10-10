import { useEffect, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../lib/websocket';
import { useSensorStore } from '../store/sensorStore';
import { SensorReading } from '../types';

export const useRealTimeData = () => {
  const { setLatestReading, addReadingToHistory } = useSensorStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = connectWebSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    const onSensorData = (data: SensorReading) => {
      setLatestReading(data);
      addReadingToHistory(data);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sensor_data', onSensorData);
    socket.on('live', onSensorData);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensor_data', onSensorData);
      socket.off('live', onSensorData);
      disconnectWebSocket();
    };
  }, [setLatestReading, addReadingToHistory]);

  return { isConnected };
};
