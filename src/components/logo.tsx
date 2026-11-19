const contours = [
  'M8 16c4 0 7-5 16-5s12 5 16 5',
  'M8 23c5 0 8 6 16 6s11-6 16-6',
  'M8 30c5 0 8 7 16 7s11-7 16-7',
  'M14 20c3 0 5 3 10 3s7-3 10-3',
];

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
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="13"
        fill="#082638"
        stroke="#a2e8fc"
        strokeOpacity=".35"
      />
      <g stroke="#bbf1ff" strokeWidth="2.2" strokeLinecap="round">
        {contours.map((path) => (
          <path key={path} d={path} />
        ))}
      </g>
    </svg>
  );
}
