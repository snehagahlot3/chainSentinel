import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    const rules = await prisma.automationRule.findMany({
      where: { organizationId },
      include: {
        tasks: true,
        executions: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rules)
  } catch (error: any) {
    console.error('Automation rules GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, triggerType, triggerConfig, tasks, organizationId } = body

    if (!name || !triggerType || !organizationId) {
      return NextResponse.json(
        { error: 'name, triggerType, and organizationId are required' },
        { status: 400 }
      )
    }

    const rule = await prisma.automationRule.create({
      data: {
        organizationId,
        name,
        description,
        triggerType,
        triggerConfig: triggerConfig || {},
        tasks: tasks ? {
          create: tasks.map((task: any, index: number) => ({
            taskType: task.taskType,
            taskConfig: task.taskConfig || {},
            order: index,
            isActive: true,
          })),
        } : undefined,
      },
      include: {
        tasks: true,
      },
    })

    return NextResponse.json(rule)
  } catch (error: any) {
    console.error('Automation rule CREATE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ruleId, name, description, triggerType, triggerConfig, isActive, tasks } = body

    if (!ruleId) {
      return NextResponse.json(
        { error: 'ruleId is required' },
        { status: 400 }
      )
    }

    const rule = await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(triggerType && { triggerType }),
        ...(triggerConfig && { triggerConfig }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { tasks: true },
    })

    if (tasks) {
      await prisma.automationTask.deleteMany({
        where: { ruleId },
      })

      for (let i = 0; i < tasks.length; i++) {
        await prisma.automationTask.create({
          data: {
            ruleId,
            taskType: tasks[i].taskType,
            taskConfig: tasks[i].taskConfig || {},
            order: i,
            isActive: true,
          },
        })
      }
    }

    const updatedRule = await prisma.automationRule.findUnique({
      where: { id: ruleId },
      include: { tasks: true },
    })

    return NextResponse.json(updatedRule)
  } catch (error: any) {
    console.error('Automation rule UPDATE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'ruleId is required' },
        { status: 400 }
      )
    }

    await prisma.automationTask.deleteMany({
      where: { ruleId },
    })

    await prisma.automationRule.delete({
      where: { id: ruleId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Automation rule DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}