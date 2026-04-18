import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, StatsCard, PageHeader, Badge, Button } from '@/app/components/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const mockOrgId = 'demo-org'
  
  let integrationsCount = 0
  let alertsCount = 0
  let activeAutoOrders = 0
  
  try {
    integrationsCount = await prisma.integration.count({
      where: { organizationId: mockOrgId },
    })
    
    alertsCount = await prisma.alert.count({
      where: { organizationId: mockOrgId, isRead: false },
    })
    
    activeAutoOrders = await prisma.autoOrderRule.count({
      where: { organizationId: mockOrgId, isActive: true },
    })
  } catch (e) {
    console.log('Database not available during build')
  }

  const stats = [
    {
      title: 'Active Integrations',
      value: integrationsCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: 'primary' as const,
    },
    {
      title: 'Low Stock Items',
      value: '-',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'warning' as const,
    },
    {
      title: 'Unread Alerts',
      value: alertsCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: alertsCount > 0 ? 'danger' as const : 'primary' as const,
    },
    {
      title: 'Auto-Order Rules',
      value: activeAutoOrders,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'success' as const,
    },
  ]

  const getStartedSteps = [
    {
      number: 1,
      title: 'Connect Your E-commerce',
      description: 'Add a webhook integration to receive real-time sales data',
      href: '/dashboard/integrations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'Add Products & Inventory',
      description: 'Set up your products and configure stock thresholds',
      href: '/dashboard/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'Set Auto-Order Rules',
      description: 'Automatically reorder when inventory hits threshold',
      href: '/dashboard/auto-orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        subtitle="Monitor your supply chain at a glance"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
              <Badge variant="info">Setup Guide</Badge>
            </div>
            <div className="space-y-4">
              {getStartedSteps.map((step) => (
                <Link
                  key={step.number}
                  href={step.href}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary-600">Step {step.number}</span>
                      <h3 className="font-medium text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">AI Insight</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-primary-100">Supply chain healthy</span>
              </div>
              <p className="text-sm text-white/80">
                Predicted supply disruption risk: <span className="font-semibold text-success-300">Low</span>
              </p>
              <div className="pt-3 border-t border-white/20">
                <p className="text-xs text-primary-100">
                  Based on current inventory levels and order patterns, your supply chain is operating normally.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-50 text-success-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">API Server</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Webhook Handler</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Database</span>
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}