import type { ComponentType } from 'react'
import { FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>
  message: string
  className?: string
}

export function EmptyState({
  icon: Icon = FileQuestion,
  message,
  className = ''
}: EmptyStateProps): JSX.Element {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  )
}
