import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors';
const variants = {
  primary: 'bg-black text-white hover:bg-[#333]',
  outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
};

type Variant = keyof typeof variants;

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}

export function LinkButton({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
