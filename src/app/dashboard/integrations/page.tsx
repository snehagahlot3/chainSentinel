'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, Badge, Button, PageHeader, EmptyState, InputLabel } from '@/app/components/ui'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const eventTypes = [
  { value: 'order.created', label: 'Order Created' },
  { value: 'inventory.updated', label: 'Inventory Updated' },
  { value: 'product.created', label: 'Product Created' },
  { value: 'product.updated', label: 'Product Updated' },
  { value: 'product.deleted', label: 'Product Deleted' },
]

export default function IntegrationsPage() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', endpointUrl: '', eventTypes: [] as string[] })
  
  const { data: integrations, error, mutate } = useSWR(
    '/api/integrations?organizationId=demo-org',
    fetcher
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, organizationId: 'demo-org' }),
    })
    setShowModal(false)
    setFormData({ name: '', endpointUrl: '', eventTypes: [] })
    mutate()
  }

  const handleEventTypeToggle = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...formData.eventTypes, type]
      : formData.eventTypes.filter(t => t !== type)
    setFormData({ ...formData, eventTypes: newTypes })
  }

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <EmptyState 
        title="Failed to load integrations"
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    </div>
  )

  return (
    <div>
      <PageHeader 
        title="Integrations" 
        subtitle="Connect your e-commerce platforms and services"
        action={
          <Button onClick={() => setShowModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Integration
          </Button>
        }
      />

      {integrations?.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          title="No integrations yet"
          description="Connect your e-commerce store to start receiving real-time sales and inventory data via webhooks."
          action={
            <Button onClick={() => setShowModal(true)}>Connect Your First Store</Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {integrations?.map((int: any) => (
            <Card key={int.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{int.name}</h3>
                      <Badge variant={int.isActive ? 'success' : 'default'}>
                        {int.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 font-mono">{int.endpointUrl}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {int.eventTypes.map((type: string) => (
                        <span key={type} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Test
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Secret Key:</span>{' '}
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                    {int.secretKey?.slice(0, 20)}...
                  </code>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add Integration</h2>
              <p className="text-sm text-slate-500 mt-1">Connect a new webhook source</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <InputLabel required>Name</InputLabel>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My E-commerce Store"
                />
              </div>
              <div>
                <InputLabel required>Webhook URL</InputLabel>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  value={formData.endpointUrl}
                  onChange={e => setFormData({ ...formData, endpointUrl: e.target.value })}
                  placeholder="https://api.mystore.com/webhook"
                />
              </div>
              <div>
                <InputLabel>Event Types</InputLabel>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {eventTypes.map(type => (
                    <label key={type.value} className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.eventTypes.includes(type.value)}
                        onChange={e => handleEventTypeToggle(type.value, e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Create Integration
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}