'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, Badge, Button, PageHeader, EmptyState, InputLabel } from '@/app/components/ui'

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

interface AutoOrderRule {
  id: string
  productId: string
  thresholdQuantity: number
  quantityToOrder: number
  supplierId: string
  isActive: boolean
  lastTriggeredAt: Date | null
  product: Product
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AutoOrdersPage() {
  const { data: rules, error: rulesError, mutate: mutateRules } = useSWR<AutoOrderRule[]>(
    '/api/auto-orders?organizationId=demo-org', 
    fetcher
  )
  const { data: products, error: productsError } = useSWR<Product[]>(
    '/api/products?organizationId=demo-org', 
    fetcher
  )
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    productId: '', 
    thresholdQuantity: '10', 
    quantityToOrder: '50',
    supplierId: 'demo-supplier',
    isActive: true 
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auto-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, organizationId: 'demo-org' })
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to create rule')
        return
      }

      setShowForm(false)
      setForm({ productId: '', thresholdQuantity: '10', quantityToOrder: '50', supplierId: 'demo-supplier', isActive: true })
      mutateRules()
    } catch {
      setErrorMsg('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (rule: AutoOrderRule) => {
    await fetch('/api/auto-orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruleId: rule.id, isActive: !rule.isActive })
    })
    mutateRules()
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    await fetch(`/api/auto-orders?ruleId=${ruleId}`, { method: 'DELETE' })
    mutateRules()
  }

  if (rulesError || productsError) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <EmptyState 
        title="Failed to load data"
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  return (
    <div>
      <PageHeader 
        title="Auto-Order Rules" 
        subtitle="Automatically reorder when inventory runs low"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Rule
              </>
            )}
          </Button>
        }
      />

      <Card className="p-5 mb-6 bg-primary-50 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-primary-900">How it works</h3>
            <p className="text-sm text-primary-700 mt-1">
              When inventory falls below the threshold, an order is automatically created for the supplier. 
              Configure thresholds in the <span className="font-medium">Inventory</span> page.
            </p>
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">Create New Rule</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <InputLabel required>Product</InputLabel>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a product</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel required>Threshold Quantity</InputLabel>
                <input
                  type="number"
                  value={form.thresholdQuantity}
                  onChange={(e) => setForm({ ...form, thresholdQuantity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">Order when stock falls below this</p>
              </div>
              <div>
                <InputLabel required>Order Quantity</InputLabel>
                <input
                  type="number"
                  value={form.quantityToOrder}
                  onChange={(e) => setForm({ ...form, quantityToOrder: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">Units to order</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !form.productId}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Rule'}
            </Button>
          </form>
        </Card>
      )}

      {!showForm && (!rules || rules.length === 0) ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          title="No auto-order rules"
          description="Create rules to automatically reorder stock when it runs low."
          action={
            <Button onClick={() => setShowForm(true)}>Create Your First Rule</Button>
          }
        />
      ) : rules && rules.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Threshold</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order Qty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Last Triggered</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{rule.product.name}</div>
                    <div className="text-xs text-slate-500">{rule.product.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{rule.thresholdQuantity}</td>
                  <td className="px-6 py-4 text-slate-600">{rule.quantityToOrder}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                        rule.isActive 
                          ? 'bg-success-100 text-success-700 hover:bg-success-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {rule.lastTriggeredAt 
                      ? new Date(rule.lastTriggeredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) 
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                      className="text-danger-600 hover:text-danger-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}