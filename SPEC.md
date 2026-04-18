# ChainSentinel - Supply Chain Integration Platform

## Project Overview
- **Project Name**: ChainSentinel
- **Type**: Supply Chain Management & E-commerce Integration Platform
- **Core Functionality**: Connect distributor websites via webhooks, manage inventory, set alerts, and automate supplier orders
- **Target Users**: Distributor-level businessmen

## Step 1: API Integration Portal

### Features
1. **Webhook Configuration**
   - Connect existing e-commerce endpoints
   - Test webhook connectivity
   - View webhook delivery history

2. **Supported Event Types**
   - `order.created` - When a sale occurs
   - `inventory.updated` - Stock level changes
   - `product.created/updated/deleted`

3. **API Key Management**
   - Generate API keys for external integrations
   - Set permissions per key
   - Track API usage

### Data Models

```
User
- id, email, password, name, role (distributor/supplier/admin)
- createdAt, updatedAt

Organization
- id, name, type (distributor/supplier)
- userId (owner)

Integration
- id, organizationId, name, endpointUrl, eventTypes[], isActive
- secretKey (for webhook verification)
- createdAt, updatedAt

WebhookEvent
- id, integrationId, eventType, payload, status (delivered/failed/pending)
- deliveredAt, retryCount

Inventory
- id, organizationId, productId, sku, quantity, minThreshold, autoOrderThreshold
- lastSyncedAt

Product
- id, organizationId, name, sku, description, price, supplierId
- createdAt, updatedAt

Alert
- id, organizationId, type (low_stock, auto_order_triggered), productId
- message, isRead, createdAt

AutoOrderRule
- id, organizationId, productId, thresholdQuantity, quantityToOrder, supplierId
- isActive, lastTriggeredAt
```

## Tech Stack
- Next.js 14 (App Router)
- PostgreSQL + Prisma
- Tailwind CSS
- TypeScript