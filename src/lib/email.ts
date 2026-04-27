import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('[Email] SMTP not configured. Email would be sent to:', options.to)
      console.log('[Email] Subject:', options.subject)
      return false
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('[Email] Sent to:', options.to)
    return true
  } catch (error: any) {
    console.error('[Email] Failed to send:', error.message)
    return false
  }
}

export async function sendLowStockEmail(to: string, productName: string, sku: string, quantity: number) {
  return sendEmail({
    to,
    subject: `Low Stock Alert: ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Alert</h2>
        <p>The following product is running low on inventory:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Product</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>SKU</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${sku}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Current Stock</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${quantity}</td>
          </tr>
        </table>
        <p>Please restock soon to avoid stockouts.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Sent by ChainSentinel - Supply Chain Control Tower</p>
      </div>
    `,
  })
}

export async function sendAutoOrderEmail(to: string, orderNumber: string, productName: string, quantity: number, supplierName: string) {
  return sendEmail({
    to,
    subject: `Auto-Order Created: ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">📦 Auto-Order Created</h2>
        <p>An automatic order has been placed due to low inventory:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order #</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Product</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Quantity</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${quantity}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Supplier</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${supplierName}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Sent by ChainSentinel - Supply Chain Control Tower</p>
      </div>
    `,
  })
}