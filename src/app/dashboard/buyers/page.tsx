'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, Badge } from '@/app/components/ui'

interface Buyer {
  id: string
  userId: string
  organizationId: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const buyersRes = await fetch('/api/buyers?organizationId=demo-org')
      const buyersData = await buyersRes.json()
      setBuyers(buyersData)
    } catch (error) {
      console.error('Error fetching buyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org',
          userId: selectedUserId
        })
      })
      if (res.ok) {
        setShowForm(false)
        setSelectedUserId('')
        fetchData()
      }
    } catch (error) {
      console.error('Error creating buyer:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this buyer?')) return
    try {
      await fetch(`/api/buyers/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting buyer:', error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Buyer'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Assign Buyer</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select User</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Select user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Assign Buyer</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buyers.map((buyer) => (
          <Card key={buyer.id}>
            <CardContent className="py-4">
              <p className="font-medium">Buyer</p>
              <p className="text-sm text-gray-500">User ID: {buyer.userId}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => handleDelete(buyer.id)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {buyers.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          No buyers assigned. A buyer can manage multiple locations.
        </div>
      )}
    </div>
  )
}