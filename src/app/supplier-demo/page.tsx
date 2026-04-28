'use client'

import { useState } from 'react'
import useSWR from 'swr'

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

const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function SupplierDemoPage() {
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

  const supplierProducts = [
    { sku: 'SUP-PROD-001', name: 'Wireless Headphones (Bulk)', price: 45.00, stock: 500 },
    { sku: 'SUP-PROD-002', name: 'Smart Watch (Bulk)', price: 120.00, stock: 200 },
    { sku: 'SUP-PROD-003', name: 'Bluetooth Speaker (Bulk)', price: 25.00, stock: 800 },
    { sku: 'SUP-PROD-004', name: 'USB-C Hub (Bulk)', price: 20.00, stock: 400 },
    { sku: 'SUP-PROD-005', name: 'Laptop Stand (Bulk)', price: 15.00, stock: 300 },
    { sku: 'SUP-PROD-006', name: 'Webcam HD (Bulk)', price: 35.00, stock: 250 },
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load orders</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-blue-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SupplyCo Demo</h1>
              <p className="text-xs text-gray-500">Supplier Portal - Receives Orders from ChainSentinel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">API Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Incoming Orders</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Orders</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {!orders ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Orders from ChainSentinel distributors will appear here when triggered by auto-order rules
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-600' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full bg-${
                                order.status === 'PENDING' ? 'yellow' :
                                order.status === 'CONFIRMED' ? 'blue' :
                                order.status === 'SHIPPED' ? 'purple' :
                                order.status === 'DELIVERED' ? 'green' : 'red'
                              }-100 text-${
                                order.status === 'PENDING' ? 'yellow' :
                                order.status === 'CONFIRMED' ? 'blue' :
                                order.status === 'SHIPPED' ? 'purple' :
                                order.status === 'DELIVERED' ? 'green' : 'red'
                              }-700`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              From: <span className="font-medium text-gray-700">{order.organization.name}</span> •{' '}
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
                          <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                                  {item.quantity}x
                                </span>
                                <span className="text-gray-700">{item.product.name}</span>
                                <code className="text-xs text-gray-400">({item.product.sku})</code>
                              </div>
                              <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Update Status:</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <span className="text-xs text-gray-400">
                          Auto-created by ChainSentinel
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Supplier Products</h3>
              <div className="space-y-3">
                {supplierProducts.map(product => (
                  <div key={product.sku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-green-600">{product.stock} available</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900">Integration Info</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This supplier portal receives orders automatically from ChainSentinel when distributor inventory falls below thresholds.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">API Endpoint</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-green-400 text-sm font-mono">
                  POST /api/supplier/orders
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                ChainSentinel calls this API to create orders when auto-order rules are triggered
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}