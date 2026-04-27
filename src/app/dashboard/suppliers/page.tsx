'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, Badge } from '@/app/components/ui'

interface Supplier {
  id: string
  name: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  apiEndpoint?: string
  leadTimeDays: number
  minimumOrderValue: number
  paymentTerms?: string
  notes?: string
  isActive: boolean
  _count?: { orders: number }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    apiEndpoint: '',
    leadTimeDays: '7',
    minimumOrderValue: '0',
    paymentTerms: '',
    notes: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers?organizationId=demo-org')
      const data = await res.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org',
          ...formData,
          leadTimeDays: parseInt(formData.leadTimeDays),
          minimumOrderValue: parseFloat(formData.minimumOrderValue)
        })
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ name: '', contactName: '', contactEmail: '', contactPhone: '', apiEndpoint: '', leadTimeDays: '7', minimumOrderValue: '0', paymentTerms: '', notes: '' })
        fetchSuppliers()
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    try {
      await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Supplier'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">New Supplier</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">API Endpoint</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.apiEndpoint}
                    onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                    placeholder="https://api.supplier.com/orders"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lead Time (days)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Order Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.minimumOrderValue}
                    onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="Net 30"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit">Create Supplier</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{supplier.name}</h3>
                <Badge variant={supplier.isActive ? 'success' : 'default'}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {supplier.contactName && <p><span className="font-medium">Contact:</span> {supplier.contactName}</p>}
                {supplier.contactEmail && <p><span className="font-medium">Email:</span> {supplier.contactEmail}</p>}
                {supplier.contactPhone && <p><span className="font-medium">Phone:</span> {supplier.contactPhone}</p>}
                <p><span className="font-medium">Lead Time:</span> {supplier.leadTimeDays} days</p>
                {supplier.minimumOrderValue > 0 && (
                  <p><span className="font-medium">Min Order:</span> ${supplier.minimumOrderValue.toFixed(2)}</p>
                )}
                {supplier._count && (
                  <p className="text-gray-500">{supplier._count.orders} order(s)</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => handleDelete(supplier.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No suppliers yet. Add your first supplier to get started.
        </div>
      )}
    </div>
  )
}