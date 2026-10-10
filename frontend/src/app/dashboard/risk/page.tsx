'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { RiskHistoryChart } from '../../../components/charts/RiskHistoryChart';
import { SHAPWaterfallChart } from '../../../components/charts/SHAPWaterfallChart';
import { RiskBadge } from '../../../components/risk/RiskBadge';
import { KeyFactors } from '../../../components/risk/KeyFactors';
import { Recommendations } from '../../../components/risk/Recommendations';
import api from '../../../lib/api';
import { RiskAssessment } from '../../../types';
import { format } from 'date-fns';

export default function RiskAnalysisPage() {
  const [latestAssessment, setLatestAssessment] = useState<RiskAssessment | null>(null);
  const [history, setHistory] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          api.get('/risk/assessments/latest').catch(() => ({ data: null })),
          api.get('/risk/assessments').catch(() => ({ data: [] }))
        ]);
        if (latestRes.data) setLatestAssessment(latestRes.data);
        if (historyRes.data) setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching risk data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const requestAnalysis = async () => {
    try {
      const res = await api.post('/risk/assessments/analyze');
      setLatestAssessment(res.data);
      setHistory(prev => [res.data, ...prev]);
      alert('Analysis completed successfully');
    } catch (error) {
      alert('Failed to run analysis');
    }
  };

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Risk Analysis</h1>
          <button 
            onClick={requestAnalysis}
            className="px-4 py-2 bg-brand-light text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            Run New Analysis
          </button>
        </div>

        {latestAssessment && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Latest Assessment Date</p>
              <p className="text-lg font-medium">{format(new Date(latestAssessment.timestamp), 'MMMM dd, yyyy HH:mm')}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                <p className="text-3xl font-bold text-gray-900">{latestAssessment.riskScore.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                <RiskBadge level={latestAssessment.riskLevel} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk History Trend</h2>
            <RiskHistoryChart data={history} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Contributions (SHAP)</h2>
            <SHAPWaterfallChart factors={latestAssessment?.keyFactors || []} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Contributing Factors</h2>
            <KeyFactors factors={latestAssessment?.keyFactors || []} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h2>
            <Recommendations recommendations={latestAssessment?.recommendations || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
