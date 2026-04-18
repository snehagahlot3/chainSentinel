export interface ChainSentinelConfig {
  storeId: string
  secretKey: string
  baseUrl?: string
  timeout?: number
}

export interface SaleData {
  productSku: string
  quantity: number
  customerEmail?: string
  orderId?: string
  amount?: number
  metadata?: Record<string, any>
}

export interface InventoryUpdateData {
  productSku: string
  quantity: number
  reason?: 'restock' | 'adjustment' | 'damage' | 'return'
}

export interface Product {
  id: string
  sku: string
  name: string
  price: number
  description?: string
}

export interface Inventory {
  id: string
  productId: string
  productSku: string
  quantity: number
  minThreshold: number
  autoOrderThreshold: number
}

export interface SaleResult {
  success: boolean
  saleId: string
  productSku: string
  quantity: number
  remainingStock: number
}

export interface ChainSentinelError {
  message: string
  code: string
  status?: number
}

export class ChainSentinelClient {
  private storeId: string
  private secretKey: string
  private baseUrl: string
  private timeout: number

  constructor(config: ChainSentinelConfig) {
    if (!config.storeId || !config.secretKey) {
      throw new Error('storeId and secretKey are required')
    }

    this.storeId = config.storeId
    this.secretKey = config.secretKey
    this.baseUrl = config.baseUrl || 'http://localhost:3000/api'
    this.timeout = config.timeout || 5000
  }

  private async request<T>(endpoint: string, method: string, data?: any): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Store-ID': this.storeId,
          'X-Secret-Key': this.secretKey,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const result = await response.json()

      if (!response.ok) {
        throw {
          message: result.error || 'Request failed',
          code: result.code || 'BAD_REQUEST',
          status: response.status,
        }
      }

      return result
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          code: 'TIMEOUT',
        }
      }

      throw {
        message: error.message || 'Network error',
        code: error.code || 'NETWORK_ERROR',
      }
    }
  }

  async sale(data: SaleData): Promise<SaleResult> {
    if (!data.productSku) {
      throw { message: 'productSku is required', code: 'MISSING_FIELDS' }
    }
    if (!data.quantity || data.quantity < 1) {
      throw { message: 'quantity must be a positive number', code: 'INVALID_QUANTITY' }
    }

    return this.request<SaleResult>('/sales', 'POST', data)
  }

  async inventoryUpdate(data: InventoryUpdateData): Promise<Inventory> {
    if (!data.productSku) {
      throw { message: 'productSku is required', code: 'MISSING_FIELDS' }
    }
    if (data.quantity < 0) {
      throw { message: 'quantity cannot be negative', code: 'INVALID_QUANTITY' }
    }

    return this.request<Inventory>('/inventory/update', 'POST', data)
  }

  async getInventory(productSku: string): Promise<Inventory> {
    if (!productSku) {
      throw { message: 'productSku is required', code: 'MISSING_FIELDS' }
    }

    return this.request<Inventory>('/inventory', 'GET', { productSku })
  }

  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products', 'GET')
  }

  async getSales(limit?: number): Promise<any[]> {
    return this.request<any[]>('/sales', 'GET', { limit })
  }
}

export default ChainSentinelClient

function ChainSentinel(config: ChainSentinelConfig): ChainSentinelClient {
  return new ChainSentinelClient(config)
}

module.exports = ChainSentinel
module.exports.ChainSentinelClient = ChainSentinelClient