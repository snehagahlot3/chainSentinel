import Link from 'next/link'
import { Card, Button } from '@/app/components/ui'

export default function Home() {
  const portalCards = [
    {
      title: 'Distributor Portal',
      description: 'Connect your e-commerce, manage inventory, set alerts & auto-orders',
      href: '/dashboard',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-primary-50 text-primary-600',
      linkText: 'Go to Dashboard',
    },
    {
      title: 'E-commerce Site',
      description: 'Proof of concept store with inventory sync and real-time updates',
      href: '/ecommerce',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-success-50 text-success-600',
      linkText: 'Visit Store',
    },
    {
      title: 'Supplier Portal',
      description: 'Receive orders from distributors, manage fulfillment, track shipments',
      href: '/supplier',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-warning-50 text-warning-600',
      linkText: 'View Orders',
    },
  ]

  const features = [
    {
      title: 'Real-time Webhooks',
      description: 'Connect your e-commerce platforms via webhooks for instant data sync',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      title: 'Smart Auto-Ordering',
      description: 'Set thresholds and automatically reorder from suppliers when stock runs low',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: 'Inventory Alerts',
      description: 'Get notified instantly when stock levels become critical or orders are triggered',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ChainSentinel</h1>
                <p className="text-xs text-slate-500">Supply Chain Control Tower</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                Predictive Supply Chain Control
              </div>
              <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                Intelligent Inventory{' '}
                <span className="text-primary-600">Management</span>
              </h1>
              <p className="text-xl text-slate-600 mt-6 leading-relaxed">
                Connect your e-commerce, automate reordering, and get real-time alerts — 
                all in one unified platform for modern supply chains.
              </p>
              <div className="flex items-center justify-center gap-4 mt-10">
                <Link href="/dashboard">
                  <Button size="lg">
                    Get Started
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/ecommerce">
                  <Button variant="secondary" size="lg">
                    View Demo Store
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {portalCards.map((card) => (
                <Link key={card.href} href={card.href} className="block group">
                  <Card hover className="p-8 h-full">
                    <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-slate-600 text-sm mb-4">{card.description}</p>
                    <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      {card.linkText}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Built for Modern Supply Chains</h2>
              <p className="text-slate-600 mt-2">Everything you need to automate and control your inventory</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Built with Next.js + PostgreSQL + Prisma
            </p>
            <p className="text-sm text-slate-400">
              ChainSentinel © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}