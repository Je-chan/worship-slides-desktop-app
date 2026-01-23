import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface CardProps extends ComponentPropsWithoutRef<'div'> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-xl border border-slate-200/80
          shadow-sm shadow-slate-200/50
          dark:bg-slate-800/80 dark:border-slate-700/50
          dark:shadow-slate-900/30
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-4 border-b border-slate-100/80 bg-slate-50/30 dark:border-slate-700/50 dark:bg-slate-800/30 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

interface CardContentProps extends ComponentPropsWithoutRef<'div'> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`px-5 py-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends ComponentPropsWithoutRef<'div'> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl dark:border-slate-700 dark:bg-slate-800 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
