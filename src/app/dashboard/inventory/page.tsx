'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, Badge, Button, PageHeader, EmptyState } from '@/app/components/ui'

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

interface Inventory {
  id: string
  productId: string
  quantity: number
  minThreshold: number
  autoOrderThreshold: number
  product: Product
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function InventoryPage() {
  const { data: inventories, error, mutate } = useSWR<Inventory[]>('/api/inventory?organizationId=demo-org', fetcher)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ quantity: 0, minThreshold: 0, autoOrderThreshold: 0 })

  const handleEdit = (inv: Inventory) => {
    setEditingId(inv.id)
    setEditForm({
      quantity: inv.quantity,
      minThreshold: inv.minThreshold,
      autoOrderThreshold: inv.autoOrderThreshold
    })
  }

  const handleSave = async (inventoryId: string) => {
    await fetch('/api/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryId, ...editForm })
    })
    setEditingId(null)
    mutate()
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const getStatusBadge = (inv: Inventory) => {
    if (inv.quantity <= inv.minThreshold) {
      return <Badge variant="danger">Low Stock</Badge>
    }
    if (inv.quantity <= inv.autoOrderThreshold) {
      return <Badge variant="warning">Reorder</Badge>
    }
    return <Badge variant="success">In Stock</Badge>
  }

  const getStatusColor = (inv: Inventory) => {
    if (inv.quantity <= inv.minThreshold) return 'text-danger-600'
    if (inv.quantity <= inv.autoOrderThreshold) return 'text-warning-600'
    return 'text-slate-900'
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <EmptyState 
        icon={
          <svg className="w-12 h-12 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        title="Failed to load inventory"
        description="There was an error loading your inventory data. Please try again."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  return (
    <div>
      <PageHeader 
        title="Inventory Management" 
        subtitle="Track and manage your product stock levels"
        action={
          <Link href="/dashboard/products">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Button>
          </Link>
        }
      />

      {inventories?.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="No inventory items"
          description="Add products to get started with inventory tracking."
          action={
            <Link href="/dashboard/products">
              <Button>Add Your First Product</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Min Threshold</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Auto-Order At</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventories?.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{inv.product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">{inv.product.sku}</code>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <span className={`font-semibold ${getStatusColor(inv)}`}>
                          {inv.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <input
                          type="number"
                          value={editForm.minThreshold}
                          onChange={(e) => setEditForm({ ...editForm, minThreshold: parseInt(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <span className="text-slate-600">{inv.minThreshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <input
                          type="number"
                          value={editForm.autoOrderThreshold}
                          onChange={(e) => setEditForm({ ...editForm, autoOrderThreshold: parseInt(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <span className="text-slate-600">{inv.autoOrderThreshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === inv.id ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="primary" size="sm" onClick={() => handleSave(inv.id)}>
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(inv)}>
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}