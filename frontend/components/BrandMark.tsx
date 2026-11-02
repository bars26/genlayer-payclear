/** PayClear mark: a pay stub with a perforated edge and a mint pay range, on a navy tile. */
export function BrandMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} role="img" aria-label="PayClear">
      <rect width="32" height="32" rx="8" fill="#0E1E33" />
      <path d="M8 6.5h16v17.2l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4Z" fill="#FFFFFF" />
      <rect x="10.4" y="9.6" width="7.6" height="1.8" rx="0.9" fill="#0E1E33" />
      <rect x="10.4" y="13.2" width="11.2" height="1.1" rx="0.55" fill="#9AA6B5" />
      <rect x="10.4" y="16.6" width="11.2" height="3.4" rx="1.1" fill="#1E9E6A" />
      <rect x="12" y="17.8" width="2.6" height="1" rx="0.5" fill="#FFFFFF" />
      <rect x="17" y="17.8" width="2.6" height="1" rx="0.5" fill="#FFFFFF" />
    </svg>
  );
}
