import type { ComponentType, ReactNode } from 'react'

interface PageHeaderProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  children,
  className = ''
}: PageHeaderProps): JSX.Element {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-900/50 flex items-center justify-center shadow-sm">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-300" />
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}
