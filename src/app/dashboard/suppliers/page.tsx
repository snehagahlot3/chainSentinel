'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, Package, AlertTriangle, CheckCircle, Star, ChevronDown } from 'lucide-react'
import { Card, PageHeader, Badge } from '@/app/components/ui'

interface Supplier {
  id: string
  name: string
  email: string
  productCount: number
  totalStock: number
  lowStockProducts: number
  avgDeliveryDays: number | null
  onTimeRate: number
  avgPrice: number
  totalOrders: number
  deliveredOrders: number
  score: number
  grade: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers?orgId=demo-org')
      const data = await res.json()
      setSuppliers(data.suppliers || [])
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100'
    if (grade === 'B') return 'text-blue-600 bg-blue-100'
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title="Supplier Scorecard" 
        subtitle="Track and evaluate supplier performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Suppliers</p>
              <p className="text-2xl font-bold text-slate-900">{summary?.total || 0}</p>
            </div>
            <Package className="w-8 h-8 text-primary-100" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">{summary?.averageScore || 0}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-100" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Top Performer</p>
              <p className="text-lg font-bold text-slate-900 truncate">{summary?.topPerformer || 'N/A'}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-100" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">At Risk</p>
              <p className="text-2xl font-bold text-red-600">{summary?.atRisk || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-100" />
          </div>
        </Card>
      </div>

      {suppliers.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No Suppliers Yet</h3>
          <p className="text-slate-500 mt-2">Assign suppliers to products to see their performance metrics here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Supplier Rankings</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {suppliers.map((supplier, index) => (
              <div 
                key={supplier.id}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedSupplier?.id === supplier.id ? 'bg-primary-50' : ''}`}
                onClick={() => setSelectedSupplier(selectedSupplier?.id === supplier.id ? null : supplier)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getGradeColor(supplier.grade)}`}>
                      {supplier.grade}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 truncate">{supplier.name}</h4>
                      {index === 0 && (
                        <Badge variant="success" className="text-xs">Top</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{supplier.email}</p>
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className={`font-bold text-xl ${getScoreColor(supplier.score)}`}>{supplier.score}</p>
                      <p className="text-slate-500 text-xs">Score</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-slate-900">{supplier.onTimeRate}%</p>
                      <p className="text-slate-500 text-xs">On-Time</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-slate-900">
                        {supplier.avgDeliveryDays !== null ? `${supplier.avgDeliveryDays}d` : 'N/A'}
                      </p>
                      <p className="text-slate-500 text-xs">Avg Delivery</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-slate-900">{supplier.productCount}</p>
                      <p className="text-slate-500 text-xs">Products</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-slate-900">{supplier.totalOrders}</p>
                      <p className="text-slate-500 text-xs">Orders</p>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${selectedSupplier?.id === supplier.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {selectedSupplier?.id === supplier.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Total Stock Units</p>
                      <p className="font-semibold text-slate-900">{supplier.totalStock.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Low Stock Products</p>
                      <p className={`font-semibold ${supplier.lowStockProducts > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>
                        {supplier.lowStockProducts} items
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Average Price</p>
                      <p className="font-semibold text-slate-900">${supplier.avgPrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Delivered Orders</p>
                      <p className="font-semibold text-slate-900">{supplier.deliveredOrders} of {supplier.totalOrders}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}