import { Switch as HeadlessSwitch } from '@headlessui/react'
import type { ReactNode } from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: string
  disabled?: boolean
  className?: string
  children?: ReactNode // 추가 콘텐츠 (예: 색상 선택기)
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  children
}: SwitchProps): JSX.Element {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          disabled:opacity-40 disabled:cursor-not-allowed
          ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </HeadlessSwitch>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
