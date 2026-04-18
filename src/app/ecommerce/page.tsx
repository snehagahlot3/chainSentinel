'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, Badge, Button } from '@/app/components/ui'

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
}

interface CartItem {
  product: Product
  quantity: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EcommercePage() {
  const { data: products, error, mutate } = useSWR<Product[]>('/api/products?organizationId=demo-org', fetcher)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    setCheckingOut(true)
    
    const orderData = {
      items: cart.map(item => ({
        sku: item.product.sku,
        quantity: item.quantity
      }))
    }

    try {
      await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-webhook-signature': 'demo-signature'
        },
        body: JSON.stringify({
          integrationId: 'demo-integration',
          eventType: 'order.created',
          payload: orderData
        })
      })
      
      setOrderSuccess(true)
      setCart([])
      setTimeout(() => {
        setOrderSuccess(false)
        setShowCart(false)
        mutate()
      }, 3000)
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckingOut(false)
    }
  }

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className="p-8 text-center">
        <p className="text-danger-600 font-medium">Failed to load products</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            Demo Store
          </h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {orderSuccess && (
          <Card className="mb-8 p-5 bg-success-50 border-success-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-success-800">Order placed successfully!</p>
                <p className="text-sm text-success-700">Inventory has been updated.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!products ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <Card className="p-12 inline-block">
                <p className="text-slate-500">No products available.</p>
                <p className="text-sm text-slate-400 mt-2">Add some from the distributor dashboard.</p>
              </Card>
            </div>
          ) : products.map((product) => (
            <Card key={product.id} className="p-6" hover>
              <div className="h-40 bg-slate-100 rounded-xl mb-5 flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-slate-500 mb-2">SKU: {product.sku}</p>
              {product.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                <Button onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {showCart && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-slate-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-slate-500">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 border border-slate-300 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 border border-slate-300 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-2 p-2 text-danger-500 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-3"
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}