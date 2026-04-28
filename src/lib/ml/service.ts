import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PredictionResult {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  daysRemaining: number | null;
  predictedDepletion: Date | null;
  riskLevel: RiskLevel;
  confidence: number;
  recommendedOrderQty: number | null;
  trend: number;
  avgDailySales: number;
}

export interface SalesDataPoint {
  date: Date;
  quantity: number;
}

const CRITICAL_DAYS = 7;
const HIGH_DAYS = 14;
const MEDIUM_DAYS = 30;

function calculateRiskLevel(daysRemaining: number | null): RiskLevel {
  if (daysRemaining === null) return 'LOW';
  if (daysRemaining <= CRITICAL_DAYS) return 'CRITICAL';
  if (daysRemaining <= HIGH_DAYS) return 'HIGH';
  if (daysRemaining <= MEDIUM_DAYS) return 'MEDIUM';
  return 'LOW';
}

function calculateTrend(salesData: SalesDataPoint[]): number {
  if (salesData.length < 2) return 0;
  
  const midPoint = Math.floor(salesData.length / 2);
  const firstHalf = salesData.slice(0, midPoint);
  const secondHalf = salesData.slice(midPoint);
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length;
  
  if (firstAvg === 0) return 0;
  return (secondAvg - firstAvg) / firstAvg;
}

async function getSalesVelocity(
  productId: string,
  days: number = 30
): Promise<{ avgDailySales: number; salesData: SalesDataPoint[] }> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.sale.findMany({
    where: {
      productId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgDailySales = totalUnits / days;

  const salesData: SalesDataPoint[] = sales.map((sale) => ({
    date: sale.createdAt,
    quantity: sale.quantity,
  }));

  return { avgDailySales, salesData };
}

async function getInventoryQuantity(productId: string, organizationId: string): Promise<number> {
  const inventory = await prisma.inventory.findFirst({
    where: { productId, organizationId },
  });
  return inventory?.quantity ?? 0;
}

export async function predictDepletion(
  productId: string,
  organizationId: string
): Promise<PredictionResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  const currentStock = await getInventoryQuantity(productId, organizationId);
  
  const [shortTerm, midTerm, longTerm] = await Promise.all([
    getSalesVelocity(productId, 7),
    getSalesVelocity(productId, 14),
    getSalesVelocity(productId, 30),
  ]);

  const trend = calculateTrend(longTerm.salesData);
  
  const weightedSales = 
    shortTerm.avgDailySales * 0.5 + 
    midTerm.avgDailySales * 0.3 + 
    longTerm.avgDailySales * 0.2;

  const trendMultiplier = 1 + trend * 0.5;
  const adjustedDailySales = weightedSales * trendMultiplier;

  let daysRemaining: number | null = null;
  let predictedDepletion: Date | null = null;

  if (adjustedDailySales > 0 && currentStock > 0) {
    daysRemaining = Math.floor(currentStock / adjustedDailySales);
    predictedDepletion = new Date();
    predictedDepletion.setDate(predictedDepletion.getDate() + daysRemaining);
  }

  const riskLevel = calculateRiskLevel(daysRemaining);
  
  const confidence = calculateConfidence(longTerm.salesData.length, trend);
  
  const recommendedOrderQty = calculateRecommendedOrderQty(
    currentStock,
    adjustedDailySales,
    daysRemaining
  );

  return {
    productId,
    productName: product.name,
    sku: product.sku,
    currentStock,
    daysRemaining,
    predictedDepletion,
    riskLevel,
    confidence,
    recommendedOrderQty,
    trend,
    avgDailySales: adjustedDailySales,
  };
}

function calculateConfidence(dataPoints: number, trend: number): number {
  let confidence = 0.5;
  
  if (dataPoints >= 30) confidence += 0.2;
  else if (dataPoints >= 14) confidence += 0.1;
  
  const trendAbs = Math.abs(trend);
  if (trendAbs < 0.1) confidence += 0.2;
  else if (trendAbs < 0.3) confidence += 0.1;
  
  return Math.min(0.95, confidence);
}

function calculateRecommendedOrderQty(
  currentStock: number,
  avgDailySales: number,
  daysRemaining: number | null
): number | null {
  if (avgDailySales <= 0) return null;
  
  const targetStock = Math.ceil(avgDailySales * 60);
  const currentDeficit = targetStock - currentStock;
  
  if (daysRemaining !== null && daysRemaining < 14) {
    return Math.max(targetStock, Math.ceil(avgDailySales * 90));
  }
  
  return Math.max(0, currentDeficit);
}

export async function batchPredict(organizationId: string): Promise<PredictionResult[]> {
  const products = await prisma.product.findMany({
    where: { organizationId },
  });

  const predictions: PredictionResult[] = [];

  for (const product of products) {
    try {
      const prediction = await predictDepletion(product.id, organizationId);
      predictions.push(prediction);
    } catch (error) {
      console.error(`Failed to predict for product ${product.id}:`, error);
    }
  }

  return predictions;
}

export async function savePredictions(
  organizationId: string,
  predictions: PredictionResult[]
): Promise<void> {
  for (const pred of predictions) {
    await prisma.prediction.upsert({
      where: {
        organizationId_productId: {
          organizationId,
          productId: pred.productId,
        },
      },
      update: {
        predictedDepletion: pred.predictedDepletion,
        riskLevel: pred.riskLevel,
        confidence: pred.confidence,
        recommendedOrderQty: pred.recommendedOrderQty,
        daysRemaining: pred.daysRemaining,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        productId: pred.productId,
        predictedDepletion: pred.predictedDepletion,
        riskLevel: pred.riskLevel,
        confidence: pred.confidence,
        recommendedOrderQty: pred.recommendedOrderQty,
        daysRemaining: pred.daysRemaining,
      },
    });
  }
}

export async function generateAndSavePredictions(organizationId: string): Promise<PredictionResult[]> {
  const predictions = await batchPredict(organizationId);
  await savePredictions(organizationId, predictions);
  return predictions;
}

export async function getSavedPredictions(
  organizationId: string,
  riskLevel?: RiskLevel
): Promise<PredictionResult[]> {
  const where: any = { organizationId };
  
  if (riskLevel) {
    where.riskLevel = riskLevel;
  }

  const predictions = await prisma.prediction.findMany({
    where,
    include: { product: true },
    orderBy: { daysRemaining: 'asc' },
  });

  return predictions.map((pred) => ({
    productId: pred.productId,
    productName: pred.product.name,
    sku: pred.product.sku,
    currentStock: 0,
    daysRemaining: pred.daysRemaining ?? null,
    predictedDepletion: pred.predictedDepletion ?? null,
    riskLevel: pred.riskLevel as RiskLevel,
    confidence: pred.confidence,
    recommendedOrderQty: pred.recommendedOrderQty ?? null,
    trend: 0,
    avgDailySales: 0,
  }));
}

export async function trainAndUpdateModel(organizationId: string): Promise<{
  success: boolean;
  predictionsCount: number;
}> {
  try {
    const predictions = await generateAndSavePredictions(organizationId);
    
    const criticalPredictions = predictions.filter(p => 
      p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
    );
    
    for (const pred of criticalPredictions) {
      const inventory = await prisma.inventory.findFirst({
        where: { organizationId, productId: pred.productId },
      });
      
      if (inventory && inventory.quantity <= inventory.minThreshold) {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            productId: pred.productId,
            type: 'LOW_STOCK',
            createdAt: { gte: new Date(Date.now() - 3600000) },
          },
        });
        
        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              organizationId,
              type: 'LOW_STOCK',
              message: `AI Warning: ${pred.productName} (${pred.sku}) will run out in ${pred.daysRemaining} days. Consider reordering ${pred.recommendedOrderQty} units.`,
              productId: pred.productId,
            },
          });
        }
      }
    }

    return {
      success: true,
      predictionsCount: predictions.length,
    };
  } catch (error) {
    console.error('Model training failed:', error);
    return {
      success: false,
      predictionsCount: 0,
    };
  }
}