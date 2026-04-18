'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, Badge, Button, PageHeader, EmptyState } from '@/app/components/ui'

interface Product {
  id: string
  name: string
  sku: string
}

interface Alert {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: Date
  product: Product | null
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const alertIcons: Record<string, React.ReactNode> = {
  LOW_STOCK: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  AUTO_ORDER_TRIGGERED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  WEBHOOK_FAILED: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
}

const alertColors: Record<string, string> = {
  LOW_STOCK: 'bg-danger-50 text-danger-600',
  AUTO_ORDER_TRIGGERED: 'bg-primary-50 text-primary-600',
  WEBHOOK_FAILED: 'bg-danger-50 text-danger-600',
  default: 'bg-slate-50 text-slate-600',
}

export default function AlertsPage() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const { data: alerts, error, mutate } = useSWR<Alert[]>(
    `/api/alerts?organizationId=demo-org${showUnreadOnly ? '&unreadOnly=true' : ''}`, 
    fetcher
  )

  const handleMarkRead = async (alertId: string, isRead: boolean) => {
    await fetch('/api/alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, isRead })
    })
    mutate()
  }

  const handleMarkAllRead = async () => {
    if (!alerts) return
    for (const alert of alerts.filter(a => !a.isRead)) {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: alert.id, isRead: true })
      })
    }
    mutate()
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <EmptyState 
        title="Failed to load alerts"
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  const unreadCount = alerts?.filter(a => !a.isRead).length || 0

  return (
    <div>
      <PageHeader 
        title="Alerts" 
        subtitle="Stay informed about important events"
        action={
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">Unread only</span>
            </label>
            {unreadCount > 0 && (
              <Button variant="ghost" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {unreadCount > 0 && (
        <Card className="p-4 mb-6 bg-danger-50 border-danger-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-danger-800">
                You have <span className="font-semibold">{unreadCount}</span> unread alert{unreadCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-danger-600">Review and mark them as read</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {!alerts || alerts.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title="No alerts yet"
            description="You'll see notifications here when important events occur."
          />
        ) : alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`p-5 transition-all ${
              !alert.isRead ? 'border-l-4 border-l-danger-300' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${alertColors[alert.type] || alertColors.default}`}>
                {alertIcons[alert.type] || alertIcons.default}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={
                    alert.type === 'LOW_STOCK' ? 'danger' : 
                    alert.type === 'AUTO_ORDER_TRIGGERED' ? 'info' : 
                    alert.type === 'WEBHOOK_FAILED' ? 'danger' : 'default'
                  }>
                    {alert.type.replace('_', ' ')}
                  </Badge>
                  {!alert.isRead && (
                    <span className="w-2 h-2 bg-danger-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-slate-900 font-medium">{alert.message}</p>
                {alert.product && (
                  <p className="text-sm text-slate-500 mt-1">
                    Product: <span className="font-medium">{alert.product.name}</span> ({alert.product.sku})
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(alert.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {!alert.isRead && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMarkRead(alert.id, true)}
                >
                  Mark read
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}