import { Button } from '@headlessui/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type IconButtonVariant = 'default' | 'ghost' | 'danger'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  icon: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
  label?: string // 접근성을 위한 aria-label
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: `
    bg-white text-slate-600 border border-slate-200
    hover:bg-slate-50 hover:border-slate-300
    dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600
    dark:hover:bg-slate-700 dark:hover:border-slate-500
  `,
  ghost: `
    bg-transparent text-slate-500
    hover:bg-slate-100 hover:text-slate-700
    dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200
  `,
  danger: `
    bg-white text-red-500 border border-red-200
    hover:bg-red-50 hover:border-red-300
    dark:bg-slate-800 dark:border-red-800 dark:hover:bg-red-900/20
  `
}

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { button: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { button: 'w-12 h-12', icon: 'w-6 h-6' }
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  label,
  className = '',
  disabled,
  ...props
}: IconButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size].button}
        ${className}
      `}
      {...props}
    >
      <span className={sizeStyles[size].icon}>{icon}</span>
    </Button>
  )
}
