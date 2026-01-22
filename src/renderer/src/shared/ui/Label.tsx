import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'
