import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const productId = searchParams.get('productId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const products = productId
      ? [{ id: productId }]
      : await prisma.product.findMany({
          where: { organizationId },
        });

    const analytics = [];

    for (const product of products) {
      for (const period of [7, 14, 30]) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const sales = await prisma.sale.findMany({
          where: {
            productId: product.id,
            createdAt: { gte: startDate },
          },
        });

        const unitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
        const avgDailySales = unitsSold / period;

        const midPoint = Math.floor(sales.length / 2);
        const firstHalf = sales.slice(0, midPoint);
        const secondHalf = sales.slice(midPoint);

        const firstAvg =
          firstHalf.reduce((sum, s) => sum + s.quantity, 0) /
          (firstHalf.length || 1);
        const secondAvg =
          secondHalf.reduce((sum, s) => sum + s.quantity, 0) /
          (secondHalf.length || 1);

        const trend = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;

        analytics.push({
          productId: product.id,
          periodDays: period,
          unitsSold,
          avgDailySales,
          trend,
        });
      }
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}