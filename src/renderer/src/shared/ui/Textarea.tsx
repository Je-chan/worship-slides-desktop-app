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
          w-full px-3 py-2 rounded-lg border bg-white text-slate-900
          placeholder:text-slate-400
          transition-colors resize-none
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
