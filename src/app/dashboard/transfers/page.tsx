'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, Badge } from '@/app/components/ui'

interface Transfer {
  id: string
  fromLocationId: string
  toLocationId: string
  productId: string
  quantity: number
  status: string
  requestedAt: string
  approvedAt?: string
  shippedAt?: string
  receivedAt?: string
  notes?: string
  fromLocation?: { name: string }
  toLocation?: { name: string }
  product?: { name: string }
}

interface Location {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    fromLocationId: '',
    toLocationId: '',
    productId: '',
    quantity: '1',
    notes: ''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/transfers?organizationId=demo-org').then(r => r.json()),
      fetch('/api/locations?organizationId=demo-org').then(r => r.json()),
      fetch('/api/products?organizationId=demo-org').then(r => r.json())
    ]).then(([transfersData, locationsData, productsData]) => {
      setTransfers(transfersData)
      setLocations(locationsData)
      setProducts(productsData)
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org',
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ fromLocationId: '', toLocationId: '', productId: '', quantity: '1', notes: '' })
        const transfersData = await fetch('/api/transfers?organizationId=demo-org').then(r => r.json())
        setTransfers(transfersData)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create transfer')
      }
    } catch (error) {
      console.error('Error creating transfer:', error)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      const transfersData = await fetch('/api/transfers?organizationId=demo-org').then(r => r.json())
      setTransfers(transfersData)
    } catch (error) {
      console.error('Error updating transfer:', error)
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      PENDING: 'warning',
      APPROVED: 'default',
      SHIPPED: 'warning',
      RECEIVED: 'success',
      REJECTED: 'danger',
      CANCELLED: 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Transfers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Request Transfer'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Request Stock Transfer</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From Location *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.fromLocationId}
                    onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
                    required
                  >
                    <option value="">Select location...</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Location *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.toLocationId}
                    onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
                    required
                  >
                    <option value="">Select location...</option>
                    {locations.filter(loc => loc.id !== formData.fromLocationId).map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Product *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                  >
                    <option value="">Select product...</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>{prod.name} ({prod.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit">Request Transfer</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{transfer.product?.name}</span>
                    {statusBadge(transfer.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {transfer.fromLocation?.name} → {transfer.toLocation?.name} | Qty: {transfer.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(transfer.requestedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {transfer.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handleStatusChange(transfer.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleStatusChange(transfer.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </>
                  )}
                  {transfer.status === 'APPROVED' && (
                    <Button size="sm" onClick={() => handleStatusChange(transfer.id, 'SHIPPED')}>
                      Mark Shipped
                    </Button>
                  )}
                  {transfer.status === 'SHIPPED' && (
                    <Button size="sm" onClick={() => handleStatusChange(transfer.id, 'RECEIVED')}>
                      Mark Received
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transfers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No transfers yet. Request a stock transfer to get started.
        </div>
      )}
    </div>
  )
}