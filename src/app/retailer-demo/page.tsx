'use client'

import { useState } from 'react'

const PRODUCTS = [
  { sku: 'PROD-001', name: 'Wireless Headphones', price: 79.99, description: 'Premium wireless headphones with noise cancellation', stock: 50 },
  { sku: 'PROD-002', name: 'Smart Watch', price: 199.99, description: 'Fitness tracking smartwatch with heart rate monitor', stock: 25 },
  { sku: 'PROD-003', name: 'Bluetooth Speaker', price: 49.99, description: 'Portable waterproof Bluetooth speaker', stock: 100 },
  { sku: 'PROD-004', name: 'USB-C Hub', price: 39.99, description: '7-in-1 USB-C hub with HDMI and card reader', stock: 75 },
  { sku: 'PROD-005', name: 'Laptop Stand', price: 29.99, description: 'Ergonomic aluminum laptop stand', stock: 40 },
  { sku: 'PROD-006', name: 'Webcam HD', price: 59.99, description: '1080p HD webcam with built-in microphone', stock: 30 },
]

const CHAIN_SENTINEL_CONFIG = {
  storeId: 'demo-org',
  apiUrl: '/api',
}

interface CartItem {
  sku: string
  name: string
  price: number
  quantity: number
}

export default function RetailerDemoPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', address: '' })
  const [processing, setProcessing] = useState(false)
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string; sales?: any[] } | null>(null)

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.sku === product.sku)
      if (existing) {
        return prev.map(item => 
          item.sku === product.sku 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { sku: product.sku, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.sku !== sku))
  }

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity < 1) return
    setCart(prev => prev.map(item => 
      item.sku === sku ? { ...item, quantity } : item
    ))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const processCheckout = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      alert('Please fill in your name and email')
      return
    }

    setProcessing(true)
    const orderId = `ORD-${Date.now()}`

    const salesResults = []

    try {
      for (const item of cart) {
        const response = await fetch(`${CHAIN_SENTINEL_CONFIG.apiUrl}/sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: CHAIN_SENTINEL_CONFIG.storeId,
            productSku: item.sku,
            quantity: item.quantity,
            customerEmail: customerInfo.email,
            orderId,
            amount: item.price * item.quantity,
            metadata: {
              customerName: customerInfo.name,
              source: 'retailer-demo',
            },
          }),
        })

        const result = await response.json()
        salesResults.push({ item, result })

        if (!response.ok) {
          throw new Error(result.error || 'Sale failed')
        }
      }

      setOrderResult({
        success: true,
        message: `Order ${orderId} placed successfully! Sales synced to ChainSentinel.`,
        sales: salesResults,
      })
      setCart([])
    } catch (error: any) {
      setOrderResult({
        success: false,
        message: error.message || 'Failed to process order',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TechStore Demo</h1>
              <p className="text-xs text-gray-500">Integrated with ChainSentinel</p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="relative p-2 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {orderResult && (
          <div className={`mb-8 p-6 rounded-xl ${orderResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-4">
              {orderResult.success ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${orderResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {orderResult.success ? 'Order Placed Successfully!' : 'Order Failed'}
                </h3>
                <p className={`text-sm mt-1 ${orderResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {orderResult.message}
                </p>
                {orderResult.sales && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">ChainSentinel Sale Responses:</p>
                    {orderResult.sales.map((sale, i) => (
                      <div key={i} className="text-xs text-gray-600 font-mono">
                        {sale.item.name}: {sale.result.success ? 'Synced ✓' : sale.result.error}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setOrderResult(null)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-900 font-medium">Demo Integration Active</p>
              <p className="text-xs text-blue-700">
                Each purchase is automatically reported to ChainSentinel via the SDK
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map(product => (
            <div key={product.sku} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <code className="text-xs text-gray-500">{product.sku}</code>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 20 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.sku} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.sku)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>

                <button
                  onClick={processCheckout}
                  disabled={processing || cart.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {processing ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  This will trigger ChainSentinel sale events and update inventory
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}