import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import {
  generateAndSavePredictions,
  getSavedPredictions,
  PredictionResult,
} from '@/lib/ml/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const riskLevel = searchParams.get('riskLevel') as any;
    const regenerate = searchParams.get('regenerate') === 'true';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    let predictions: PredictionResult[];

    if (regenerate) {
      predictions = await generateAndSavePredictions(organizationId);
    } else {
      predictions = await getSavedPredictions(organizationId, riskLevel);
      
      if (predictions.length === 0) {
        predictions = await generateAndSavePredictions(organizationId);
      }
    }

    for (const pred of predictions) {
      const inv = await prisma.inventory.findFirst({
        where: { productId: pred.productId },
        orderBy: { quantity: 'desc' },
      });
      if (inv) {
        pred.currentStock = inv.quantity;
      }
    }

    return NextResponse.json(predictions);
  } catch (error: any) {
    console.error('Predictions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}