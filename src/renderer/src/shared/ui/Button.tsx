import { Button as HeadlessButton } from '@headlessui/react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary-500 to-primary-600 text-white
    hover:from-primary-600 hover:to-primary-700
    active:from-primary-700 active:to-primary-800
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-white text-slate-700 border border-slate-200
    hover:bg-slate-50 hover:border-slate-300
    active:bg-slate-100
    shadow-sm
    dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600
    dark:hover:bg-slate-700 dark:hover:border-slate-500
    dark:active:bg-slate-600
  `,
  ghost: `
    bg-transparent text-slate-600
    hover:bg-slate-100 hover:text-slate-900
    active:bg-slate-200
    dark:text-slate-400
    dark:hover:bg-slate-700 dark:hover:text-slate-100
    dark:active:bg-slate-600
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 text-white
    hover:from-red-600 hover:to-red-700
    active:from-red-700 active:to-red-800
    shadow-sm hover:shadow-md
  `
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <HeadlessButton
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium rounded-xl
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
          dark:focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </HeadlessButton>
    )
  }
)

Button.displayName = 'Button'
