import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface CardProps extends ComponentPropsWithoutRef<'div'> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-2xl border border-slate-200/60
          shadow-sm hover:shadow-md
          transition-all duration-200
          dark:bg-slate-800 dark:border-slate-700/60
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
        className={`px-6 py-5 border-b border-slate-100 dark:border-slate-700 ${className}`}
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
      <div ref={ref} className={`px-6 py-5 ${className}`} {...props}>
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
        className={`px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl dark:border-slate-700 dark:bg-slate-900/50 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
