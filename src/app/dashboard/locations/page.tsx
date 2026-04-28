'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader } from '@/app/components/ui'

interface Location {
  id: string
  name: string
  type: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  latitude?: number
  longitude?: number
  isActive: boolean
  _count?: { supplierAssignments: number }
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'STORE',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations?organizationId=demo-org')
      const data = await res.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org',
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
        })
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ name: '', type: 'STORE', address: '', city: '', state: '', zipCode: '', country: 'US', latitude: '', longitude: '' })
        fetchLocations()
      }
    } catch (error) {
      console.error('Error creating location:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return
    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' })
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Location'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">New Location</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="STORE">Store</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="DISTRIBUTION_CENTER">Distribution Center</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zip Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-74.0060"
                  />
                </div>
              </div>
              <Button type="submit">Create Location</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{location.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{location.type}</p>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {location.address && <p>{location.address}</p>}
                {(location.city || location.state || location.zipCode) && (
                  <p>{[location.city, location.state, location.zipCode].filter(Boolean).join(', ')}</p>
                )}
                {location._count && (
                  <p className="text-gray-500 mt-2">
                    {location._count.supplierAssignments} supplier(s) assigned
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => handleDelete(location.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No locations yet. Add your first location to get started.
        </div>
      )}
    </div>
  )
}