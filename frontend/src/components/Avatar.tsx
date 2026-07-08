import { initials } from '../utils/format.js';
import { cn } from '../utils/cn.js';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-2xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-semibold text-brand-700 ring-1 ring-brand-500/20',
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span>{initials(name) || '?'}</span>
      )}
    </div>
  );
}
