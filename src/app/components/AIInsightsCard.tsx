'use client';

import useSWR from 'swr';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Prediction {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  daysRemaining: number | null;
  predictedDepletion: string | null;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  recommendedOrderQty: number | null;
  trend: number;
  avgDailySales: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AIInsightsCard({ organizationId }: { organizationId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: predictions, error, mutate } = useSWR<Prediction[]>(
    `${API_URL}/api/ai/predictions?organizationId=${organizationId}&regenerate=false`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const criticalItems = predictions?.filter(
    (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
  ) ?? [];
  
  const safePredictions = predictions ?? [];
  const allLowRisk = safePredictions.every(
    (p) => p.riskLevel === 'LOW' || p.daysRemaining === null
  );
  const hasData = safePredictions.length > 0;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-danger-600 bg-danger-50';
      case 'HIGH':
        return 'text-warning-600 bg-warning-50';
      case 'MEDIUM':
        return 'text-info-600 bg-info-50';
      default:
        return 'text-success-600 bg-success-50';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return '↑';
    if (trend < -0.1) return '↓';
    return '→';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.1) return 'text-success-600';
    if (trend < -0.1) return 'text-danger-600';
    return 'text-slate-400';
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">AI Insight</h2>
        </div>
        <p className="text-sm text-white/80">Unable to load predictions</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">AI Insight</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-warning-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-primary-100">Analyzing inventory...</span>
        </div>
        <p className="text-sm text-white/80 mt-3">
          No sales data yet. Make your first sale to start AI predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">AI Insight</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh predictions"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              allLowRisk ? 'bg-success-400' : 'bg-warning-400'
            }`}
          ></span>
          <span className="text-sm text-primary-100">
            {allLowRisk ? 'Supply chain healthy' : 'Attention required'}
          </span>
        </div>
        <p className="text-sm text-white/80">
          Predicted supply disruption risk:{' '}
          <span className="font-semibold">
            {allLowRisk ? 'Low' : 'Elevated'}
          </span>
        </p>

        {criticalItems.length > 0 && (
          <div className="pt-3 border-t border-white/20">
            <p className="text-xs text-primary-100 mb-2">
              Items needing attention:
            </p>
            <div className="space-y-2">
              {criticalItems.slice(0, 3).map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-xs bg-white/10 rounded-lg p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-white/60 truncate">
                      {item.daysRemaining} days left ·{' '}
                      <span className={getTrendColor(item.trend)}>
                        {getTrendIcon(item.trend)} {Math.abs(item.trend * 100).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                      item.riskLevel
                    )}`}
                  >
                    {item.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {criticalItems.length === 0 && (
          <div className="pt-3 border-t border-white/20">
            <p className="text-xs text-primary-100">
              Based on current inventory levels and order patterns, your supply chain is operating
              normally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}