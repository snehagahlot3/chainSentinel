'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, Button, PageHeader, Badge, EmptyState, InputLabel } from '@/app/components/ui'

interface Task {
  id: string
  taskType: string
  taskConfig: string
  order: number
}

interface Execution {
  id: string
  status: string
  startedAt: Date
}

interface Rule {
  id: string
  name: string
  description: string | null
  triggerType: string
  triggerConfig: string
  isActive: boolean
  tasks: Task[]
  executions: Execution[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const triggers = [
  { value: 'INVENTORY_BELOW_THRESHOLD', label: 'Inventory Below Threshold' },
  { value: 'INVENTORY_ZERO', label: 'Inventory Zero' },
  { value: 'SALE_COMPLETED', label: 'Sale Completed' },
  { value: 'LARGE_ORDER', label: 'Large Order' },
  { value: 'MANUAL', label: 'Manual' },
]

const tasks = [
  { value: 'EMAIL', label: 'Email', icon: '✉️' },
  { value: 'API_CALL', label: 'API Call', icon: '🌐' },
  { value: 'WEBHOOK', label: 'Webhook', icon: '🔗' },
  { value: 'CREATE_ORDER', label: 'Create Order', icon: '📦' },
  { value: 'SMS', label: 'SMS', icon: '📱' },
]

export default function AutomationsPage() {
  const { data: rules, error, mutate } = useSWR<Rule[]>('/api/automations?organizationId=demo-org', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', triggerType: 'INVENTORY_BELOW_THRESHOLD', threshold: '10' })
  const [taskList, setTaskList] = useState<Array<{ taskType: string; config: Record<string, string> }>>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const addTask = () => setTaskList([...taskList, { taskType: 'EMAIL', config: {} }])
  const removeTask = (i: number) => setTaskList(taskList.filter((_, idx) => idx !== i))
  const updateTask = (i: number, f: string, v: string) => {
    const copy = [...taskList]
    copy[i].config[f] = v
    setTaskList(copy)
  }
  const updateTaskType = (i: number, t: string) => {
    const copy = [...taskList]
    copy[i].taskType = t
    copy[i].config = {}
    setTaskList(copy)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const config: Record<string, any> = {}
    if (form.triggerType === 'INVENTORY_BELOW_THRESHOLD' || form.triggerType === 'LARGE_ORDER') {
      config.threshold = parseInt(form.threshold)
    }

    const payload = taskList.map((t, i) => ({ taskType: t.taskType, taskConfig: t.config, order: i }))

    const res = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description, triggerType: form.triggerType, triggerConfig: config, organizationId: 'demo-org', tasks: payload }),
    })

    if (!res.ok) {
      setErrorMsg((await res.json()).error || 'Failed')
      setLoading(false)
      return
    }

    setShowForm(false)
    setForm({ name: '', description: '', triggerType: 'INVENTORY_BELOW_THRESHOLD', threshold: '10' })
    setTaskList([])
    mutate()
    setLoading(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch('/api/automations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruleId: id, isActive: active }) })
    mutate()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    await fetch('/api/automations?ruleId=' + id, { method: 'DELETE' })
    mutate()
  }

  if (error) return <div className="p-8 text-center"><EmptyState title="Failed to load" action={<Button onClick={() => window.location.reload()}>Retry</Button>} /></div>

  return (
    <div>
      <PageHeader title="Automation Rules" subtitle="Create rules to automate tasks based on triggers" action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create Rule'}</Button>} />

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-5">New Automation Rule</h3>
          <form onSubmit={submit} className="space-y-5">
            {errorMsg && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
            <div className="grid grid-cols-2 gap-5">
              <div><InputLabel required>Name</InputLabel><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" required placeholder="e.g., Low Stock Alert" /></div>
              <div><InputLabel>Description</InputLabel><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" /></div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div><InputLabel required>Trigger</InputLabel><select value={form.triggerType} onChange={e => setForm({...form, triggerType: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">{triggers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              {(form.triggerType === 'INVENTORY_BELOW_THRESHOLD' || form.triggerType === 'LARGE_ORDER') && <div><InputLabel required>Threshold</InputLabel><input type="number" value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" min="1" /></div>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-3"><InputLabel>Tasks</InputLabel><Button type="button" variant="secondary" size="sm" onClick={addTask}>Add Task</Button></div>
              {taskList.length === 0 ? <div className="p-6 bg-slate-50 text-center text-slate-500 text-sm rounded-lg">No tasks. Click Add Task.</div> : (
                <div className="space-y-3">
                  {taskList.map((t, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <select value={t.taskType} onChange={e => updateTaskType(i, e.target.value)} className="px-3 py-2 border rounded-lg text-sm">{tasks.map(x => <option key={x.value} value={x.value}>{x.icon} {x.label}</option>)}</select>
                        {t.taskType === 'EMAIL' && <><input type="email" placeholder="To email" value={t.config.to || ''} onChange={e => updateTask(i, 'to', e.target.value)} className="px-3 py-2 border rounded-lg text-sm" /><input type="text" placeholder="Subject" value={t.config.subject || ''} onChange={e => updateTask(i, 'subject', e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1" /></>}
                        {t.taskType === 'API_CALL' && <><input type="url" placeholder="URL" value={t.config.url || ''} onChange={e => updateTask(i, 'url', e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1" /><select value={t.config.method || 'POST'} onChange={e => updateTask(i, 'method', e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option></select></>}
                        {t.taskType === 'WEBHOOK' && <input type="url" placeholder="Webhook URL" value={t.config.url || ''} onChange={e => updateTask(i, 'url', e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1" />}
                        {t.taskType === 'CREATE_ORDER' && <><input type="text" placeholder="Supplier ID" value={t.config.supplierId || ''} onChange={e => updateTask(i, 'supplierId', e.target.value)} className="px-3 py-2 border rounded-lg text-sm" /><input type="number" placeholder="Qty" value={t.config.quantity || ''} onChange={e => updateTask(i, 'quantity', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-24" /></>}
                        {t.taskType === 'SMS' && <><input type="tel" placeholder="Phone" value={t.config.to || ''} onChange={e => updateTask(i, 'to', e.target.value)} className="px-3 py-2 border rounded-lg text-sm" /><input type="text" placeholder="Message" value={t.config.message || ''} onChange={e => updateTask(i, 'message', e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1" /></>}
                        <button type="button" onClick={() => removeTask(i)} className="text-slate-400 hover:text-red-500">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading || !form.name || taskList.length === 0} className="w-full">{loading ? 'Creating...' : 'Create Rule'}</Button>
          </form>
        </Card>
      )}

      {!showForm && (!rules || rules.length === 0) ? (
        <EmptyState title="No automation rules" description="Create rules to automate tasks." action={<Button onClick={() => setShowForm(true)}>Create Rule</Button>} />
      ) : rules && (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={rule.isActive ? 'w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center' : 'w-12 h-12 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center'}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <Badge variant={rule.isActive ? 'success' : 'default'}>{rule.isActive ? 'Active' : 'Disabled'}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Trigger: {triggers.find(t => t.value === rule.triggerType)?.label || rule.triggerType}</span>
                      <span>Tasks: {rule.tasks.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(rule.id, !rule.isActive)} className={rule.isActive ? 'px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full' : 'px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full'}>{rule.isActive ? 'Disable' : 'Enable'}</button>
                  <Button variant="ghost" size="sm" onClick={() => remove(rule.id)} className="text-red-600">Delete</Button>
                </div>
              </div>
              {rule.tasks.length > 0 && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  {rule.tasks.map(task => (
                    <span key={task.id} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg">{tasks.find(t => t.value === task.taskType)?.icon} {tasks.find(t => t.value === task.taskType)?.label}</span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}