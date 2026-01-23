import { Radio, RadioGroup } from '@headlessui/react'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = ''
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <RadioGroup value={value} onChange={onChange} className={`flex gap-2 ${className}`}>
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className={({ checked }) =>
            `flex-1 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all text-center
            ${
              checked
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
            }`
          }
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  )
}
