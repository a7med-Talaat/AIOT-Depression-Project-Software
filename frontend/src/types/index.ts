export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SensorReading {
  id: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  spO2: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gasLevel: number;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  timestamp: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  keyFactors: { factor: string; contribution: number }[];
  recommendations: string[];
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: string;
  type: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
}

export interface DashboardSummary {
  currentRiskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  latestHeartRate: number;
  latestSpO2: number;
  activityLevel: string;
  activeAlerts: number;
}
