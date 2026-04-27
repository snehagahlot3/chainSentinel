'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, Button, PageHeader, Badge, EmptyState, InputLabel } from '@/app/components/ui'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  lastUsedAt: Date | null
  createdAt: Date
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ApiKeysPage() {
  const { data: keys, error, mutate } = useSWR<ApiKey[]>('/api/api-keys?organizationId=demo-org', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, organizationId: 'demo-org' }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErrorMsg(data.error || 'Failed')
      setLoading(false)
      return
    }
    setNewKey(data.key)
    setShowForm(false)
    setForm({ name: '' })
    mutate()
    setLoading(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch('/api/api-keys', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKeyId: id, isActive: active }) })
    mutate()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this API key?')) return
    await fetch('/api/api-keys?apiKeyId=' + id, { method: 'DELETE' })
    mutate()
  }

  const copy = (k: string) => navigator.clipboard.writeText(k)

  if (error) return <div className="p-8 text-center"><EmptyState title="Failed to load" action={<Button onClick={() => window.location.reload()}>Retry</Button>} /></div>

  return (
    <div>
      <PageHeader title="API Keys" subtitle="Manage API keys for external integrations" action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Generate New Key'}</Button>} />

      {newKey && (
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">API Key Created!</h3>
              <p className="text-sm text-green-700">Copy now - you won&apos;t see it again.</p>
              <div className="mt-3 flex gap-2">
                <code className="flex-1 px-4 py-2 bg-white border border-green-200 rounded-lg font-mono text-sm">{newKey}</code>
                <Button variant="secondary" size="sm" onClick={() => copy(newKey)}>Copy</Button>
              </div>
              <button onClick={() => setNewKey(null)} className="mt-3 text-sm text-green-700 underline">I copied it</button>
            </div>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-5">Generate New API Key</h3>
          <form onSubmit={submit} className="space-y-5">
            {errorMsg && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
            <div><InputLabel required>Key Name</InputLabel><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" required placeholder="e.g., Production Store" /></div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">Default Permissions</p>
              <div className="flex gap-2"><Badge variant="info">sale</Badge><Badge variant="info">inventory</Badge><Badge variant="info">product</Badge></div>
            </div>
            <Button type="submit" disabled={loading || !form.name} className="w-full">{loading ? 'Generating...' : 'Generate Key'}</Button>
          </form>
        </Card>
      )}

      {!showForm && (!keys || keys.length === 0) ? (
        <EmptyState title="No API keys" description="Generate a key to integrate your store." action={<Button onClick={() => setShowForm(true)}>Generate Key</Button>} />
      ) : keys && (
        <div className="space-y-4">
          {keys.map(k => (
            <Card key={k.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={k.isActive ? 'w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center' : 'w-12 h-12 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center'}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{k.name}</h3>
                      <Badge variant={k.isActive ? 'success' : 'default'}>{k.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{k.key.slice(0, 20)}...</code>
                    <div className="text-sm text-slate-500 mt-2">Created: {new Date(k.createdAt).toLocaleDateString()}{k.lastUsedAt && ' • Last used: ' + new Date(k.lastUsedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(k.id, !k.isActive)} className={k.isActive ? 'px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full' : 'px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full'}>{k.isActive ? 'Disable' : 'Enable'}</button>
                  <Button variant="ghost" size="sm" onClick={() => remove(k.id)} className="text-red-600">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 mt-6 bg-slate-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="font-semibold">How to use</h3>
            <p className="text-sm text-slate-600 mt-1">Include in request headers:</p>
            <div className="mt-3 bg-slate-900 rounded-lg p-4 text-white font-mono text-sm">
              <p>X-Store-ID: demo-org</p>
              <p>X-Secret-Key: cs_your_key_here</p>
            </div>
            <p className="text-xs text-slate-500 mt-3">See <a href="/docs" className="text-primary-600 underline">Documentation</a> for guides.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}