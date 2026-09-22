export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-100 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#cbf94a" />
        <path d="M9 22V10h10M9 16h7" stroke="#0a0b0d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="23" cy="21" r="2.5" fill="#0a0b0d" />
      </svg>
      FITTRACK
    </span>
  )
}
