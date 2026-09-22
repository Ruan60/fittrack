import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

const base =
  'w-full h-12 rounded-xl border bg-ink-850 px-4 text-[15px] text-ink-100 placeholder:text-ink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400/60'

interface FieldProps {
  label: string
  error?: string
  hint?: ReactNode
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, error, hint, suffix, id, className = '', ...rest }, ref) {
    const fid = id ?? rest.name
    return (
      <label htmlFor={fid} className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-300">{label}</span>
        <span className="relative block">
          <input
            ref={ref}
            id={fid}
            aria-invalid={Boolean(error)}
            className={`${base} ${error ? 'border-red-500/60' : 'border-ink-700'} ${suffix ? 'pr-12' : ''} ${className}`}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-ink-500">
              {suffix}
            </span>
          )}
        </span>
        {error ? (
          <span className="mt-1.5 block text-xs text-red-400">{error}</span>
        ) : hint ? (
          <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>
        ) : null}
      </label>
    )
  },
)

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, id, className = '', ...rest },
  ref,
) {
  const fid = id ?? rest.name
  return (
    <label htmlFor={fid} className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-300">{label}</span>
      <select
        ref={ref}
        id={fid}
        aria-invalid={Boolean(error)}
        className={`${base} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238a919c%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10 ${error ? 'border-red-500/60' : 'border-ink-700'} ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  )
})
