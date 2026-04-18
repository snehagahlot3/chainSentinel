import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, sendLowStockEmail, sendAutoOrderEmail } from '@/lib/email'

export type TaskType = 'EMAIL' | 'API_CALL' | 'WEBHOOK' | 'CREATE_ORDER' | 'SMS'
export type TriggerType = 'INVENTORY_BELOW_THRESHOLD' | 'INVENTORY_ZERO' | 'INVENTORY_RESTOCK' | 'SALE_COMPLETED' | 'LARGE_ORDER' | 'MANUAL'
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

interface TriggerContext {
  type: TriggerType
  organizationId: string
  productSku?: string
  quantity?: number
  saleId?: string
  metadata?: Record<string, any>
}

export async function executeAutomationEngine(context: TriggerContext) {
  const { type, organizationId } = context

  const rules = await prisma.automationRule.findMany({
    where: {
      organizationId,
      isActive: true,
      triggerType: type,
    },
    include: {
      tasks: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  for (const rule of rules) {
    if (shouldTrigger(rule, context)) {
      await executeRule(rule, context)
    }
  }
}

function shouldTrigger(rule: any, context: TriggerContext): boolean {
  const config = rule.triggerConfig as Record<string, any>

  switch (context.type) {
    case 'INVENTORY_BELOW_THRESHOLD':
      if (context.quantity !== undefined && config.threshold) {
        return context.quantity <= config.threshold
      }
      return true

    case 'SALE_COMPLETED':
      if (config.productSku && config.productSku !== '*') {
        return context.productSku === config.productSku
      }
      return true

    case 'LARGE_ORDER':
      if (config.minQuantity) {
        return (context.quantity || 0) >= config.minQuantity
      }
      return true

    default:
      return true
  }
}

async function executeRule(rule: any, context: TriggerContext) {
  const execution = await prisma.ruleExecution.create({
    data: {
      ruleId: rule.id,
      triggerData: context as any,
      status: 'RUNNING',
    },
  })

  try {
    for (const task of rule.tasks) {
      await executeTask(task, execution.id, context)
    }

    await prisma.ruleExecution.update({
      where: { id: execution.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
  } catch (error: any) {
    await prisma.ruleExecution.update({
      where: { id: execution.id },
      data: { status: 'FAILED', errorMessage: error.message },
    })
  }
}

async function executeTask(task: any, executionId: string, context: TriggerContext) {
  const taskExecution = await prisma.taskExecution.create({
    data: {
      taskId: task.id,
      executionId,
      status: 'RUNNING',
    },
  })

  try {
    const config = task.taskConfig as Record<string, any>
    let result: string

    switch (task.taskType) {
      case 'EMAIL':
        result = await executeEmailTask(config, context)
        break
      case 'API_CALL':
        result = await executeApiCallTask(config, context)
        break
      case 'WEBHOOK':
        result = await executeWebhookTask(config, context)
        break
      case 'CREATE_ORDER':
        result = await executeCreateOrderTask(config, context)
        break
      case 'SMS':
        result = await executeSmsTask(config, context)
        break
      default:
        throw new Error(`Unknown task type: ${task.taskType}`)
    }

    await prisma.taskExecution.update({
      where: { id: taskExecution.id },
      data: {
        status: 'COMPLETED',
        result,
        completedAt: new Date(),
      },
    })
  } catch (error: any) {
    await prisma.taskExecution.update({
      where: { id: taskExecution.id },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        completedAt: new Date(),
      },
    })
    throw error
  }
}

async function executeEmailTask(config: Record<string, any>, context: TriggerContext): Promise<string> {
  const { to, subject, template, variables } = config
  
  const emailData = {
    to: interpolate(to, context),
    subject: interpolate(subject, context),
    body: interpolate(template, context),
    ...variables,
  }

  await sendEmail({
    to: emailData.to,
    subject: emailData.subject,
    html: `<p>${emailData.body}</p>`,
  })
  
  await prisma.alert.create({
    data: {
      organizationId: context.organizationId,
      type: 'LOW_STOCK',
      message: `Email sent: ${emailData.subject} to ${emailData.to}`,
    },
  })

  return JSON.stringify(emailData)
}

async function executeApiCallTask(config: Record<string, any>, context: TriggerContext): Promise<string> {
  const { url, method, headers, body } = config
  
  const response = await fetch(url, {
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(interpolateObject(body, context)),
  })

  const result = await response.text()
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} - ${result}`)
  }

  return result
}

async function executeWebhookTask(config: Record<string, any>, context: TriggerContext): Promise<string> {
  const { url, headers, event } = config

  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: context,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': crypto
        .createHmac('sha256', config.secret || '')
        .update(JSON.stringify(webhookPayload))
        .digest('hex'),
      ...headers,
    },
    body: JSON.stringify(webhookPayload),
  })

  return `Webhook delivered: ${response.status}`
}

async function executeCreateOrderTask(config: Record<string, any>, context: TriggerContext): Promise<string> {
  const { supplierId, quantity, productSkuMapping } = config

  const mappedSku = productSkuMapping?.[context.productSku || ''] || context.productSku

  const orderNumber = `AUTO-${Date.now()}`

  const product = await prisma.product.findFirst({
    where: {
      organizationId: context.organizationId,
      sku: context.productSku,
    },
  })

  const order = await prisma.order.create({
    data: {
      organizationId: context.organizationId,
      orderNumber,
      status: 'PENDING',
      totalAmount: product ? product.price * quantity : 0,
      supplierId,
      items: {
        create: {
          productId: product?.id || '',
          quantity,
          price: product?.price || 0,
        },
      },
    },
  })

  await prisma.alert.create({
    data: {
      organizationId: context.organizationId,
      type: 'AUTO_ORDER_TRIGGERED',
      message: `Auto-order created: ${orderNumber} for ${quantity} units`,
      productId: product?.id,
    },
  })

  return JSON.stringify(order)
}

async function executeSmsTask(config: Record<string, any>, context: TriggerContext): Promise<string> {
  const { to, message } = config

  console.log('[SMS Task]', {
    to: interpolate(to, context),
    message: interpolate(message, context),
  })

  return 'SMS sent (simulated)'
}

function interpolate(template: string, context: TriggerContext): string {
  return template
    .replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const path = key.trim()
      return getNestedValue(context, path) || ''
    })
}

function interpolateObject(obj: any, context: TriggerContext): any {
  if (typeof obj === 'string') return interpolate(obj, context)
  if (Array.isArray(obj)) return obj.map(item => interpolateObject(item, context))
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, interpolateObject(v, context)])
    )
  }
  return obj
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}