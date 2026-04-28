const API_URL = 'http://localhost:3000/api'

async function test() {
  // Get API key
  const keysRes = await fetch(`${API_URL}/api-keys?organizationId=demo-org`)
  const keys = await keysRes.json()
  const secretKey = keys[0]?.key

  // Reset and make fresh sale
  const invRes = await fetch(`${API_URL}/inventory?organizationId=demo-org`)
  const invData = await invRes.json()
  const prod1 = invData.find(i => i.product?.sku === 'PROD-001')
  
  // Reset to 12 (threshold is 10)
  await fetch(`${API_URL}/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inventoryId: prod1.id, quantity: 12 })
  })

  // Sale of 5 units - new quantity = 7 (below threshold of 10)
  await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeId: 'demo-org',
      secretKey: secretKey,
      productSku: 'PROD-001',
      quantity: 5,
      customerEmail: 'newcustomer@test.com',
      orderId: 'FRESHTEST-001',
      amount: 399.95
    })
  })

  // Check results
  const alertsRes = await fetch(`${API_URL}/alerts?organizationId=demo-org`)
  const alerts = await alertsRes.json()
  
  console.log('Total alerts:', alerts.length)
  console.log('\nRecent alerts (freshest first):')
  alerts.slice(0, 3).forEach(a => console.log(' -', a.type, ':', a.message.slice(0, 80)))
  console.log('\n✅ Test complete!')
}

test().catch(console.error)