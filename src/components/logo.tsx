import Image from 'next/image';

export function Mark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <Image className={className} src="/icon.svg" width={size} height={size} alt="" unoptimized />
  );
}
