export function ProgressBar({ value, className = '', thin }: { value: number; className?: string; thin?: boolean }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-ink-800 ${thin ? 'h-1.5' : 'h-2.5'} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-lime-400 transition-[width] duration-700 ease-out" style={{ width: `${v}%` }} />
    </div>
  )
}
