import { create } from 'zustand';
import { SensorReading } from '../types';

interface SensorState {
  latestReading: SensorReading | null;
  readingsHistory: SensorReading[];
  setLatestReading: (reading: SensorReading) => void;
  addReadingToHistory: (reading: SensorReading) => void;
  setReadingsHistory: (readings: SensorReading[]) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latestReading: null,
  readingsHistory: [],
  setLatestReading: (reading) => set({ latestReading: reading }),
  addReadingToHistory: (reading) =>
    set((state) => {
      const newHistory = [...state.readingsHistory, reading].slice(-50); // Keep last 50 readings
      return { readingsHistory: newHistory };
    }),
  setReadingsHistory: (readings) => set({ readingsHistory: readings }),
}));
