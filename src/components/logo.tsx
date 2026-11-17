export function Mark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 8v32h15c10 0 16-6 16-13 0-5-3-9-8-11M9 8h15c6 0 10 3 10 7 0 5-5 8-11 8H9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 30c4 0 5 4 9 4s5-4 9-4M16 15h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
