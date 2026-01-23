import { X } from 'lucide-react'

interface TagBadgeProps {
  name: string
  variant?: 'display' | 'selected' | 'toggle'
  isSelected?: boolean
  onRemove?: () => void
  onToggle?: () => void
  className?: string
}

export function TagBadge({
  name,
  variant = 'display',
  isSelected = false,
  onRemove,
  onToggle,
  className = ''
}: TagBadgeProps): JSX.Element {
  // Display variant - readonly tag
  if (variant === 'display') {
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/80 text-slate-600 border border-slate-200/50 dark:bg-slate-700/80 dark:text-slate-300 dark:border-slate-600/50 ${className}`}
      >
        {name}
      </span>
    )
  }

  // Selected variant - removable tag
  if (variant === 'selected') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white ${className}`}
      >
        {name}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </span>
    )
  }

  // Toggle variant - selectable tag button
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
        isSelected
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm shadow-primary-600/30'
          : 'bg-slate-100/80 text-slate-600 border border-slate-200/50 hover:bg-slate-200/80 hover:text-slate-800 hover:border-slate-300/50 dark:bg-slate-700/80 dark:text-slate-300 dark:border-slate-600/50 dark:hover:bg-slate-600 dark:hover:text-slate-100'
      } ${className}`}
    >
      {name}
    </button>
  )
}
