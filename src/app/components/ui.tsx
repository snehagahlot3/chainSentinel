export function Card({ 
  children, 
  className = '',
  hover = false
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card ${hover ? 'hover:shadow-card-hover hover:border-primary-200 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    info: 'bg-primary-100 text-primary-700',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-danger-600 text-white hover:bg-danger-700',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function StatsCard({ title, value, icon, trend, trendType, color = 'primary' }: StatsCardProps) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  }
  
  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trendType === 'up' ? 'text-success-600' : 
            trendType === 'down' ? 'text-danger-600' : 
            'text-slate-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
      </div>
    </Card>
  )
}

export function PageHeader({ 
  title, 
  subtitle,
  action 
}: { 
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ 
  icon, 
  title, 
  description,
  action 
}: { 
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <Card className="p-12 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-slate-500 mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  )
}

export function InputLabel({ 
  children, 
  required 
}: { 
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-danger-500 ml-1">*</span>}
    </label>
  )
}

export function FormField({ 
  children,
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}