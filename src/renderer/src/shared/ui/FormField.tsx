import { Field, Description } from '@headlessui/react'
import { ReactNode } from 'react'

interface FormFieldProps {
  children: ReactNode
  error?: string
  description?: string
}

export function FormField({ children, error, description }: FormFieldProps): JSX.Element {
  return (
    <Field className="space-y-1.5">
      {children}
      {description && !error && (
        <Description className="text-sm text-slate-500">{description}</Description>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Field>
  )
}
