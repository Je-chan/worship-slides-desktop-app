import { Label as HeadlessLabel } from '@headlessui/react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, ...props }, ref) => {
    return (
      <HeadlessLabel
        ref={ref}
        className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </HeadlessLabel>
    )
  }
)

Label.displayName = 'Label'
