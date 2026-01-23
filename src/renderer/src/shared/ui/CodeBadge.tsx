interface CodeBadgeProps {
  code: string
  order?: number | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

export function CodeBadge({
  code,
  order,
  size = 'md',
  className = ''
}: CodeBadgeProps): JSX.Element {
  return (
    <span
      className={`rounded-lg bg-gradient-to-r from-primary-100 to-primary-200/80 dark:from-primary-800/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 font-mono font-bold shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {code}
      {order}
    </span>
  )
}
