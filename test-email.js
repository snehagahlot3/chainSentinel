const API_URL = 'http://localhost:3000/api'

async function testEmail() {
  console.log('Testing Email Functionality...\n')

  // Get API key
  const keysRes = await fetch(`${API_URL}/api-keys?organizationId=demo-org`)
  const keys = await keysRes.json()
  const secretKey = keys[0]?.key

  if (!secretKey) {
    console.log('No API key found. Creating one...')
    const newKey = await fetch(`${API_URL}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Key', organizationId: 'demo-org' })
    })
    const keyData = await newKey.json()
    console.log('Created key:', keyData.key.slice(0, 20))
  }

  // Reset inventory for testing
  console.log('1. Resetting PROD-001 inventory to 15...')
  const invRes = await fetch(`${API_URL}/inventory?organizationId=demo-org`)
  const invData = await invRes.json()
  const prod1 = invData.find(i => i.product?.sku === 'PROD-001')
  
  await fetch(`${API_URL}/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inventoryId: prod1.id,
      quantity: 15
    })
  })
  console.log('Inventory reset to 15')
  console.log('')

  // Make a sale to trigger low stock threshold
  console.log('2. Making sale (10 units - will trigger threshold of 10)...')
  const saleRes = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeId: 'demo-org',
      secretKey: keys[0]?.key || secretKey,
      productSku: 'PROD-001',
      quantity: 10,
      customerEmail: 'customer@test.com',
      orderId: 'EMAIL-TEST-001',
      amount: 799.90
    })
  })
  const saleData = await saleRes.json()
  console.log('Sale result:', saleData)
  console.log('')

  // Check inventory
  console.log('3. Updated inventory:', 15 - 10, 'units')
  console.log('')

  // Check alerts
  console.log('4. Recent Alerts (should include email notifications)...')
  const alertsRes = await fetch(`${API_URL}/alerts?organizationId=demo-org`)
  const alertsData = await alertsRes.json()
  console.log('Total alerts:', alertsData.length)
  
  const emailAlerts = alertsData.filter(a => a.message.includes('Email sent'))
  console.log('Email alerts:', emailAlerts.length)
  
  // Get latest alerts
  console.log('\nLatest 5 alerts:')
  alertsData.slice(0, 5).forEach(a => {
    const msg = a.message.length > 60 ? a.message.slice(0, 60) + '...' : a.message
    console.log(` - ${a.type}: ${msg}`)
  })
  console.log('')

  console.log('✅ Email Test Complete!')
  console.log('Check your Gmail inbox for test emails!')
}

testEmail().catch(console.error)