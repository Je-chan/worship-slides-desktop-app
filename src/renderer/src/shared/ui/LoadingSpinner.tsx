interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'kiosk'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3'
}

export function LoadingSpinner({
  message = '로딩 중...',
  size = 'md',
  variant = 'default',
  className = ''
}: LoadingSpinnerProps): JSX.Element {
  const spinnerColor =
    variant === 'kiosk'
      ? 'border-white/30 border-t-white'
      : 'border-primary-500 border-t-transparent'

  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`${sizeClasses[size]} ${spinnerColor} rounded-full animate-spin`} />
        {message && (
          <p
            className={
              variant === 'kiosk'
                ? 'text-white/70'
                : 'text-slate-500 dark:text-slate-400'
            }
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
