'use client'

import { useState, useEffect } from 'react'
import { Card, PageHeader, Badge } from '@/app/components/ui'
import { TrendingUp, TrendingDown, Minus, Calendar, Package, ArrowUp, ArrowDown, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'

interface AnalyticsData {
  dailyData: { date: string; quantity: number }[]
  forecast: { date: string; predicted: number; confidence: number; lower: number; upper: number }[]
  topProducts: { id: string; name: string; sku: string; total: number }[]
  summary: {
    totalUnits: number
    avgDailySales: number
    peakDay: { date: string; quantity: number }
    trend: 'up' | 'down' | 'stable'
    seasonality: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?orgId=demo-org&days=${selectedPeriod}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5" />
    if (trend === 'down') return <TrendingDown className="w-5 h-5" />
    return <Minus className="w-5 h-5" />
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600 bg-green-100'
    if (trend === 'down') return 'text-red-600 bg-red-100'
    return 'text-slate-600 bg-slate-100'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const chartData = data?.dailyData.map(d => ({
    date: formatDate(d.date),
    sales: d.quantity
  })) || []

  const forecastData = data?.forecast.map(f => ({
    date: formatDate(f.date),
    forecast: f.predicted,
    lower: f.lower,
    upper: f.upper
  })) || []

  const combinedChartData = [
    ...chartData.map(d => ({ date: d.date, actual: d.sales, forecast: null })),
    ...forecastData.map(d => ({ date: d.date, actual: null, forecast: d.forecast }))
  ]

  return (
    <div>
      <PageHeader 
        title="Demand Analytics & Forecasting" 
        subtitle="AI-powered sales predictions and trends"
        action={
          <div className="flex gap-2">
            {['30', '60', '90'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period} Days
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Units Sold</p>
              <p className="text-2xl font-bold text-slate-900">{data?.summary.totalUnits.toLocaleString() || 0}</p>
            </div>
            <Package className="w-8 h-8 text-primary-100" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg Daily Sales</p>
              <p className="text-2xl font-bold text-slate-900">{data?.summary.avgDailySales || 0}</p>
            </div>
            <Target className="w-8 h-8 text-blue-100" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Sales Trend</p>
              <p className="text-lg font-bold capitalize">{data?.summary.trend || 'stable'}</p>
            </div>
            <div className={`p-2 rounded-lg ${getTrendColor(data?.summary.trend || 'stable')}`}>
              {getTrendIcon(data?.summary.trend || 'stable')}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Peak Day</p>
              <p className="text-lg font-bold text-slate-900">
                {data?.summary.peakDay ? formatDate(data.summary.peakDay.date) : 'N/A'}
              </p>
              <p className="text-sm text-slate-500">{data?.summary.peakDay?.quantity || 0} units</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-100" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Historical Sales</h3>
            <Badge variant="info">Actual Data</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">30-Day Forecast</h3>
            <Badge variant="success">AI Predicted</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Sales History + Forecast</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
              <span className="text-slate-600">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600">Forecast</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={false}
                name="Sales"
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#22c55e" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                name="Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Top Selling Products</h3>
          <Badge variant="info">{selectedPeriod} Days</Badge>
        </div>
        {data?.topProducts && data.topProducts.length > 0 ? (
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{product.total.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">units sold</p>
                </div>
                <div className="w-32">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full"
                      style={{ 
                        width: `${(product.total / (data.topProducts[0]?.total || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No sales data available. Connect your store to see analytics.
          </div>
        )}
      </Card>
    </div>
  )
}