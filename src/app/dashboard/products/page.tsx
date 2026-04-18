'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, Badge, Button, PageHeader, EmptyState, InputLabel } from '@/app/components/ui'

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductsPage() {
  const { data: products, error, mutate } = useSWR<Product[]>('/api/products?organizationId=demo-org', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', description: '', price: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, organizationId: 'demo-org' })
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to create product')
        return
      }

      setShowForm(false)
      setForm({ name: '', sku: '', description: '', price: '' })
      mutate()
    } catch {
      setErrorMsg('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <EmptyState 
        title="Failed to load products"
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  return (
    <div>
      <PageHeader 
        title="Products" 
        subtitle="Manage your product catalog"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">Create New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel required>Product Name</InputLabel>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <InputLabel required>SKU</InputLabel>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <InputLabel>Description</InputLabel>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>

            <div>
              <InputLabel required>Price</InputLabel>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </Card>
      )}

      {!showForm && (!products || products.length === 0) ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="No products yet"
          description="Add your first product to get started."
          action={
            <Button onClick={() => setShowForm(true)}>Add Your First Product</Button>
          }
        />
      ) : products && products.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">{product.sku}</code>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-600">{product.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {products && products.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Link href="/dashboard/inventory" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Go to Inventory
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}