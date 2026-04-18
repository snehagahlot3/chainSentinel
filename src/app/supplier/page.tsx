'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, Badge, Button, PageHeader, EmptyState } from '@/app/components/ui'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    sku: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: Date
  organization: {
    id: string
    name: string
  }
  items: OrderItem[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CONFIRMED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  SHIPPED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  DELIVERED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CANCELLED: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function SupplierPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { data: orders, error, mutate } = useSWR<Order[]>(
    `/api/supplier/orders?supplierId=demo-supplier${statusFilter ? `&status=${statusFilter}` : ''}`, 
    fetcher
  )

  const handleStatusChange = async (orderId: string, status: string) => {
    await fetch('/api/supplier/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    })
    mutate()
  }

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <EmptyState 
        title="Failed to load orders"
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Supplier Portal</h1>
              <p className="text-sm text-slate-500">View and manage incoming orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Orders</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {!orders ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title="No orders yet"
              description="Orders from distributors will appear here when they trigger auto-orders."
            />
          ) : orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.status === 'PENDING' ? 'bg-warning-100 text-warning-600' :
                    order.status === 'CONFIRMED' ? 'bg-primary-100 text-primary-600' :
                    order.status === 'SHIPPED' ? 'bg-primary-100 text-primary-600' :
                    order.status === 'DELIVERED' ? 'bg-success-100 text-success-600' :
                    'bg-danger-100 text-danger-600'
                  }`}>
                    {statusIcons[order.status] || statusIcons.PENDING}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900 text-lg">Order #{order.orderNumber}</h3>
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      From: <span className="font-medium text-slate-700">{order.organization.name}</span> •{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">${order.totalAmount.toFixed(2)}</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="mt-3 text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-medium text-slate-600">
                          {item.quantity}x
                        </span>
                        <span className="text-slate-700">
                          {item.product.name}
                        </span>
                        <code className="text-xs text-slate-400">({item.product.sku})</code>
                      </div>
                      <span className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}