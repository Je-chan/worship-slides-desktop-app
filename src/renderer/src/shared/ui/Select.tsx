import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 pr-9 rounded-lg border bg-white text-slate-900 text-sm
            shadow-sm shadow-slate-100
            appearance-none cursor-pointer
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 focus:shadow-md focus:shadow-primary-100/50
            hover:border-slate-300 hover:shadow
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none
            dark:bg-slate-800/80 dark:text-slate-100
            dark:shadow-slate-900/20
            dark:hover:border-slate-500 dark:hover:shadow-slate-900/30
            dark:focus:shadow-primary-900/20
            dark:disabled:bg-slate-900 dark:disabled:text-slate-500
            ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400 focus:shadow-red-100/50' : 'border-slate-200/80 dark:border-slate-700/60'}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    )
  }
)

Select.displayName = 'Select'
