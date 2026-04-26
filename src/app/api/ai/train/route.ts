import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { trainAndUpdateModel } from '@/lib/ml/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const result = await trainAndUpdateModel(organizationId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Train API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}