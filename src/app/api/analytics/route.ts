import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId') || 'demo-org'
    const days = parseInt(request.nextUrl.searchParams.get('days') || '90')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const sales = await prisma.sale.findMany({
      where: { organizationId: orgId, createdAt: { gte: startDate } },
      include: { product: true },
      orderBy: { createdAt: 'asc' }
    })

    const dailySales: Record<string, number> = {}
    const productSales: Record<string, { name: string; sku: string; total: number; trend: number[] }> = {}

    sales.forEach(sale => {
      const dateKey = new Date(sale.createdAt).toISOString().split('T')[0]
      dailySales[dateKey] = (dailySales[dateKey] || 0) + sale.quantity

      if (!productSales[sale.productId || 'unknown']) {
        productSales[sale.productId || 'unknown'] = {
          name: sale.product?.name || 'Unknown',
          sku: sale.product?.sku || 'N/A',
          total: 0,
          trend: []
        }
      }
      productSales[sale.productId || 'unknown'].total += sale.quantity
    })

    const dailyData = Object.entries(dailySales)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, quantity]) => ({ date, quantity }))

    const forecast = generateForecast(dailyData, 30)

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0)
    const avgDailySales = totalUnits / days

    const seasonality = calculateSeasonality(dailyData)

    return NextResponse.json({
      dailyData,
      forecast,
      topProducts,
      summary: {
        totalUnits,
        avgDailySales: Math.round(avgDailySales),
        peakDay: dailyData.reduce((max, d) => d.quantity > max.quantity ? d : max, dailyData[0]),
        trend: calculateTrend(dailyData),
        seasonality: Math.round(seasonality * 100) / 100
      },
      predictions: generateStockPredictions(orgId)
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function generateForecast(historical: { date: string; quantity: number }[], days: number) {
  if (historical.length < 7) return []

  const recentAvg = historical.slice(-7).reduce((sum, d) => sum + d.quantity, 0) / 7
  const trend = calculateTrendValue(historical)

  const forecast = []
  const lastDate = new Date(historical[historical.length - 1].date)

  for (let i = 1; i <= days; i++) {
    const date = new Date(lastDate)
    date.setDate(date.getDate() + i)

    const seasonalFactor = 1 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.1
    const predicted = Math.max(0, Math.round((recentAvg + trend * i) * seasonalFactor))

    const confidence = Math.max(50, 95 - (i * 1.5))

    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted,
      confidence: Math.round(confidence),
      lower: Math.round(predicted * 0.8),
      upper: Math.round(predicted * 1.2)
    })
  }

  return forecast
}

function calculateTrendValue(data: { date: string; quantity: number }[]): number {
  if (data.length < 14) return 0

  const mid = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, mid)
  const secondHalf = data.slice(mid)

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length

  return (secondAvg - firstAvg) / mid
}

function calculateTrend(data: { date: string; quantity: number }[]): 'up' | 'down' | 'stable' {
  if (data.length < 14) return 'stable'
  const trend = calculateTrendValue(data)
  if (trend > 0.5) return 'up'
  if (trend < -0.5) return 'down'
  return 'stable'
}

function calculateSeasonality(data: { date: string; quantity: number }[]): number {
  if (data.length < 30) return 0

  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]

  data.forEach(d => {
    const day = new Date(d.date).getDay()
    weekdayTotals[day] += d.quantity
    weekdayCounts[day]++
  })

  const weekdayAvgs = weekdayTotals.map((total, i) => total / Math.max(weekdayCounts[i], 1))
  const overallAvg = weekdayAvgs.reduce((a, b) => a + b, 0) / 7

  const variance = weekdayAvgs.reduce((sum, avg) => sum + Math.pow(avg - overallAvg, 2), 0) / 7
  return Math.sqrt(variance) / overallAvg
}

function generateStockPredictions(orgId: string) {
  return []
}