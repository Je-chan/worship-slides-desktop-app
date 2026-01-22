import { Textarea as HeadlessTextarea } from '@headlessui/react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <HeadlessTextarea
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-xl border bg-white text-slate-900
          placeholder:text-slate-400
          transition-all duration-200 ease-out resize-none
          shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 focus:shadow-md
          hover:border-slate-400
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none
          dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500
          dark:hover:border-slate-500
          dark:disabled:bg-slate-900 dark:disabled:text-slate-500
          ${error ? 'border-red-400 focus:ring-red-500/50 focus:border-red-400' : 'border-slate-200 dark:border-slate-600'}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
