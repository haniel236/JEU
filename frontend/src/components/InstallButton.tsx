import { Download } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall.js';
import { cn } from '../utils/cn.js';

export function InstallButton({ className }: { className?: string }) {
  const { canInstall, promptInstall } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      className={cn('btn-primary', className)}
    >
      <Download className="h-4 w-4" />
      Installer l'application
    </button>
  );
}
