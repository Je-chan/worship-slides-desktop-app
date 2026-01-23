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
    bg-gradient-to-b from-primary-600 to-primary-700 text-white
    shadow-sm shadow-primary-700/30
    hover:from-primary-700 hover:to-primary-800 hover:shadow-md hover:shadow-primary-800/30
    active:from-primary-800 active:to-primary-900
  `,
  secondary: `
    bg-white text-slate-700 border border-slate-200/80
    shadow-sm shadow-slate-200/50
    hover:bg-slate-50 hover:border-slate-300 hover:shadow
    active:bg-slate-100 active:shadow-none
    dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/50
    dark:shadow-slate-900/30
    dark:hover:bg-slate-700 dark:hover:border-slate-600
    dark:active:bg-slate-600
  `,
  ghost: `
    bg-transparent text-slate-600
    hover:bg-slate-100/80 hover:text-slate-900
    active:bg-slate-200/80
    dark:text-slate-400
    dark:hover:bg-slate-800/80 dark:hover:text-slate-100
    dark:active:bg-slate-700
  `,
  danger: `
    bg-gradient-to-b from-red-500 to-red-600 text-white
    shadow-sm shadow-red-600/30
    hover:from-red-600 hover:to-red-700 hover:shadow-md hover:shadow-red-700/30
    active:from-red-700 active:to-red-800
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
          inline-flex items-center justify-center font-medium rounded-lg
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-1
          dark:focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed
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
