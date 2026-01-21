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
          w-full px-3 py-2 rounded-lg border bg-white text-slate-900
          placeholder:text-slate-400
          transition-colors
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

Input.displayName = 'Input'
