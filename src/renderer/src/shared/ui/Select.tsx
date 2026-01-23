import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  disabled = false,
  className = ''
}: SelectProps<T>): JSX.Element {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <ListboxButton
          className={`
            relative w-full px-4 py-2.5 pr-10 text-left
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-600
            rounded-xl text-sm
            shadow-sm shadow-slate-100 dark:shadow-slate-900/20
            transition-all duration-150
            hover:border-slate-300 dark:hover:border-slate-500
            focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <ListboxOptions
          anchor="bottom"
          className={`
            w-[var(--button-width)] mt-1 z-50
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-600
            rounded-xl shadow-lg
            max-h-60 overflow-auto
            focus:outline-none
          `}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ focus, selected }) =>
                `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm
                ${focus ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-slate-100'}
                `
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
