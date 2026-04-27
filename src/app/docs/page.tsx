'use client'

import { useState } from 'react'
import { Card, Button } from '@/app/components/ui'
import Link from 'next/link'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'server-sdk', label: 'Server-Side SDK' },
  { id: 'frameworks', label: 'Framework Examples' },
  { id: 'automation', label: 'Automation Rules' },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const CodeBlock = ({ code, title }: { code: string; title?: string }) => (
    <div className="bg-slate-900 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
      {title && <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{title}</div>}
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900">ChainSentinel</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Developer Documentation</span>
            </div>
            <Link href="/" className="text-sm text-slate-600 hover:text-primary-600">← Back to Home</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <aside className="w-56 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">ChainSentinel Developer Documentation</h1>
                  <p className="text-lg text-slate-600">
                    Integrate ChainSentinel into your e-commerce platform to automate inventory management, 
                    trigger orders, and receive real-time alerts.
                  </p>
                </div>

                <Card className="p-6 bg-primary-50 border-primary-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900">Server-Side SDK (Recommended)</h3>
                      <p className="text-sm text-primary-700 mt-1">
                        This guide covers the server-side SDK which is the most secure method for production integrations.
                      </p>
                    </div>
                  </div>
                </Card>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">How It Works</h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Your Store</p>
                      </div>
                      <div className="flex-1 px-4">
                        <div className="border-t-2 border-dashed border-slate-300"></div>
                        <p className="text-xs text-slate-500 text-center mt-2">sale event</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">ChainSentinel</p>
                      </div>
                      <div className="flex-1 px-4">
                        <div className="border-t-2 border-dashed border-slate-300"></div>
                        <p className="text-xs text-slate-500 text-center mt-2">execute tasks</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Supplier</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs">1</span>
                      Report Sales
                    </h3>
                    <p className="text-sm text-slate-600">
                      When a customer purchases a product, send the sale data to ChainSentinel API.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs">2</span>
                      Update Inventory
                    </h3>
                    <p className="text-sm text-slate-600">
                      Inventory is automatically decremented. Custom inventory updates are also supported.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs">3</span>
                      Trigger Automation
                    </h3>
                    <p className="text-sm text-slate-600">
                      Based on your rules, ChainSentinel executes tasks: email, API calls, orders, etc.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs">4</span>
                      Alerts & Dashboard
                    </h3>
                    <p className="text-sm text-slate-600">
                      View all activity in your dashboard, receive alerts, and manage automation rules.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'quickstart' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Quick Start</h1>
                  <p className="text-lg text-slate-600">
                    Get up and running in 5 minutes with the server-side SDK.
                  </p>
                </div>

                <CodeBlock code="npm install @chainsentinel/sdk" title="Installation" />

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Step 1: Get Your Credentials</h3>
                  <ol className="space-y-3 text-slate-600">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                      <span>Sign up at ChainSentinel</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                      <span>Create a new organization in your dashboard</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                      <span>Create API keys in the dashboard</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
                      <span>Copy your storeId and secretKey</span>
                    </li>
                  </ol>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Step 2: Initialize the SDK</h3>
                  <CodeBlock code={`import ChainSentinel from '@chainsentinel/sdk';

const sentinel = new ChainSentinel({
  storeId: 'store_abc123',
  secretKey: 'sk_live_xyz789'
});`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Step 3: Report a Sale</h3>
                  <CodeBlock code={`// After successful payment
const sale = await sentinel.sale({
  productSku: 'PROD-001',
  quantity: 2,
  customerEmail: 'customer@example.com',
  orderId: 'ORD-12345',
  amount: 99.98
});

console.log('Sale recorded:', sale.saleId);`} />
                </Card>

                <Card className="p-6 bg-success-50 border-success-200">
                  <h3 className="font-semibold text-success-900 mb-2">That&apos;s It!</h3>
                  <p className="text-sm text-success-700">
                    ChainSentinel will automatically update inventory, check automation rules, 
                    and execute any configured tasks. Check your dashboard to see the sale.
                  </p>
                </Card>
              </div>
            )}

            {activeSection === 'server-sdk' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Server-Side SDK Reference</h1>
                  <p className="text-lg text-slate-600">
                    Complete reference for the ChainSentinel Node.js SDK.
                  </p>
                </div>

                <CodeBlock code="npm install @chainsentinel/sdk" title="Installation" />

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Initialization</h3>
                  <CodeBlock code={`import ChainSentinel from '@chainsentinel/sdk';

const sentinel = new ChainSentinel({
  storeId: 'your_store_id',
  secretKey: 'your_secret_key',
  baseUrl: 'https://api.chainsentinel.io/v1',
  timeout: 5000
});`} />
                </Card>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Methods</h2>
                  
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="font-mono text-lg text-slate-900 mb-3">sentinel.sale(data)</h3>
                      <p className="text-slate-600 mb-4">Record a sale event.</p>
                      
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Parameters:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li><code className="text-primary-600">productSku</code> (string, required) - Product SKU</li>
                          <li><code className="text-primary-600">quantity</code> (number, required) - Quantity purchased</li>
                          <li><code className="text-primary-600">customerEmail</code> (string, optional) - Customer email</li>
                          <li><code className="text-primary-600">orderId</code> (string, optional) - Order ID</li>
                          <li><code className="text-primary-600">amount</code> (number, optional) - Total amount</li>
                          <li><code className="text-primary-600">metadata</code> (object, optional) - Additional data</li>
                        </ul>
                      </div>
                      
                      <CodeBlock code={`const result = await sentinel.sale({
  productSku: 'PROD-001',
  quantity: 2,
  customerEmail: 'customer@example.com',
  orderId: 'ORD-12345',
  amount: 99.98,
  metadata: { paymentMethod: 'stripe' }
});`} />
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-mono text-lg text-slate-900 mb-3">sentinel.inventoryUpdate(data)</h3>
                      <p className="text-slate-600 mb-4">Update inventory levels directly.</p>
                      <CodeBlock code={`await sentinel.inventoryUpdate({
  productSku: 'PROD-001',
  quantity: 100,
  reason: 'restock'
});`} />
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-mono text-lg text-slate-900 mb-3">sentinel.getInventory(productSku)</h3>
                      <p className="text-slate-600 mb-4">Get current inventory for a product.</p>
                      <CodeBlock code={`const inventory = await sentinel.getInventory('PROD-001');
console.log(inventory.quantity);`} />
                    </Card>
                  </div>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Error Handling</h3>
                  <CodeBlock code={`try {
  await sentinel.sale({ productSku: 'PROD-001', quantity: 1 });
} catch (error) {
  if (error.code === 'INVALID_SKU') {
    // Handle invalid product
  } else if (error.code === 'RATE_LIMITED') {
    // Handle rate limiting
  }
}`} />
                </Card>
              </div>
            )}

            {activeSection === 'frameworks' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Framework Integration Examples</h1>
                  <p className="text-lg text-slate-600">
                    Code examples for integrating ChainSentinel with popular frameworks.
                  </p>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Node.js / Express</h3>
                  <CodeBlock code={`const express = require('express');
const ChainSentinel = require('@chainsentinel/sdk');

const app = express();
app.use(express.json());

const sentinel = new ChainSentinel({
  storeId: process.env.CHAINSENTINEL_STORE_ID,
  secretKey: process.env.CHAINSENTINEL_SECRET_KEY
});

app.post('/checkout', async (req, res) => {
  const { items, customer, orderId } = req.body;

  try {
    const payment = await processPayment(customer, items);
    
    if (payment.success) {
      for (const item of items) {
        await sentinel.sale({
          productSku: item.sku,
          quantity: item.quantity,
          customerEmail: customer.email,
          orderId: orderId,
          amount: item.price * item.quantity
        });
      }
      res.json({ success: true, orderId });
    }
  } catch (error) {
    console.error('ChainSentinel error:', error.message);
    res.json({ success: true });
  }
});

app.listen(3000);`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Python / Flask</h3>
                  <CodeBlock code={`from flask import Flask, request, jsonify
import chainsentinel

app = Flask(__name__)

sentinel = chainsentinel.Client(
    store_id=os.environ.get('CHAIN_SENTINEL_STORE_ID'),
    secret_key=os.environ.get('CHAIN_SENTINEL_SECRET_KEY')
)

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    
    try:
        payment = process_payment(data)
        
        if payment.success:
            for item in data['items']:
                sentinel.sale(
                    product_sku=item['sku'],
                    quantity=item['quantity'],
                    customer_email=data['customer']['email'],
                    order_id=data['order_id'],
                    amount=item['price'] * item['quantity']
                )
            return jsonify({'success': True})
    except chainsentinel.ChainSentinelError as e:
        app.logger.error(f"ChainSentinel error: {e}")
    
    return jsonify({'success': False}), 400`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">PHP / Laravel</h3>
                  <CodeBlock code={`<?php
use ChainSentinel\\Client;

$sentinel = new Client(
    config('services.chainsentinel.store_id'),
    config('services.chainsentinel.secret_key')
);

public function processCheckout(Request $request)
{
    $items = $request->input('items');
    $customer = $request->input('customer');
    
    $payment = $this->processPayment($items, $customer);
    
    if ($payment->isSuccessful()) {
        foreach ($items as $item) {
            $sentinel->sale([
                'product_sku' => $item['sku'],
                'quantity' => $item['quantity'],
                'customer_email' => $customer['email'],
                'order_id' => $request->order_id,
                'amount' => $item['price'] * $item['quantity']
            ]);
        }
        
        return response()->json(['success' => true]);
    }
    
    return response()->json(['error' => 'Payment failed'], 400);
}`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Go</h3>
                  <CodeBlock code={`package main

import (
    "os"
    chainsentinel "github.com/chainsentinel/sdk-go"
)

func main() {
    client := chainsentinel.NewClient(
        chainsentinel.WithStoreID(os.Getenv("CHAIN_SENTINEL_STORE_ID")),
        chainsentinel.WithSecretKey(os.Getenv("CHAIN_SENTINEL_SECRET_KEY")),
    )

    sale := &chainsentinel.SaleRequest{
        ProductSku:    "PROD-001",
        Quantity:     2,
        CustomerEmail: "customer@example.com",
        OrderID:       "ORD-12345",
        Amount:        99.98,
    }

    resp, err := client.Sale(sale)
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }

    fmt.Printf("Sale recorded: %s\\n", resp.ID)
}`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">cURL (Any Language)</h3>
                  <CodeBlock code={`# Test sale recording
curl -X POST https://api.chainsentinel.io/v1/sales \\
  -H "Content-Type: application/json" \\
  -H "X-Store-ID: store_abc123" \\
  -H "X-Secret-Key: sk_live_xyz789" \\
  -d '{
    "productSku": "PROD-001",
    "quantity": 1,
    "customerEmail": "test@example.com",
    "orderId": "TEST-001",
    "amount": 49.99
  }'`} />
                </Card>
              </div>
            )}

            {activeSection === 'automation' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Automation Rules</h1>
                  <p className="text-lg text-slate-600">
                    Configure automated tasks that trigger when inventory levels change or sales occur.
                  </p>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Supported Automation Actions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Action Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 px-4"><code className="bg-slate-100 px-2 py-1 rounded">email</code></td>
                          <td className="py-3 px-4 text-slate-600">Send email notification</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="bg-slate-100 px-2 py-1 rounded">api_call</code></td>
                          <td className="py-3 px-4 text-slate-600">Call external API</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="bg-slate-100 px-2 py-1 rounded">webhook</code></td>
                          <td className="py-3 px-4 text-slate-600">Trigger a webhook</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="bg-slate-100 px-2 py-1 rounded">create_order</code></td>
                          <td className="py-3 px-4 text-slate-600">Create order on supplier</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="bg-slate-100 px-2 py-1 rounded">sms</code></td>
                          <td className="py-3 px-4 text-slate-600">Send SMS notification</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Example: Low Stock Email Alert</h3>
                  <CodeBlock code={`{
  "name": "Low Stock Alert",
  "trigger": {
    "type": "INVENTORY_BELOW_THRESHOLD",
    "threshold": 10
  },
  "tasks": [
    {
      "taskType": "EMAIL",
      "taskConfig": {
        "to": "manager@example.com",
        "subject": "Low Stock Alert: {{product.name}}",
        "body": "Product {{product.name}} ({{product.sku}}) has only {{inventory.quantity}} units left."
      }
    }
  ]
}`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Example: Auto-Reorder from Supplier</h3>
                  <CodeBlock code={`{
  "name": "Auto Reorder Rule",
  "trigger": {
    "type": "INVENTORY_BELOW_THRESHOLD",
    "threshold": 5
  },
  "tasks": [
    {
      "taskType": "CREATE_ORDER",
      "taskConfig": {
        "supplierId": "supplier_abc123",
        "quantity": 50,
        "productSkuMapping": {
          "PROD-001": "SUP-PROD-001"
        }
      }
    },
    {
      "taskType": "EMAIL",
      "taskConfig": {
        "to": "operations@example.com",
        "subject": "Auto-order placed",
        "body": "Ordered 50 units of {{product.name}} from supplier"
      }
    }
  ]
}`} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Managing Automation Rules via API</h3>
                  <CodeBlock code={`# Create automation rule
POST /api/automations
{
  "name": "Low Stock Alert",
  "triggerType": "INVENTORY_BELOW_THRESHOLD",
  "triggerConfig": { "threshold": 10 },
  "organizationId": "demo-org",
  "tasks": [
    {
      "taskType": "EMAIL",
      "taskConfig": {
        "to": "alert@example.com",
        "subject": "Low Stock Alert"
      }
    }
  ]
}

# List rules
GET /api/automations?organizationId=demo-org

# Update rule
PUT /api/automations
{ "ruleId": "...", "isActive": false }

# Delete rule
DELETE /api/automations?ruleId=...`} />
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}