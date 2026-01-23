import { Input as HeadlessInput } from '@headlessui/react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <HeadlessInput
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border bg-white text-slate-900 text-sm
          shadow-sm shadow-slate-100
          placeholder:text-slate-400
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 focus:shadow-md focus:shadow-primary-100/50
          hover:border-slate-300 hover:shadow
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none
          dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500
          dark:shadow-slate-900/20
          dark:hover:border-slate-500 dark:hover:shadow-slate-900/30
          dark:focus:shadow-primary-900/20
          dark:disabled:bg-slate-900 dark:disabled:text-slate-500
          ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400 focus:shadow-red-100/50' : 'border-slate-200/80 dark:border-slate-700/60'}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
