import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, playSound, toggleMuted, unlockAudio } from '../utils/sound.js';
import { cn } from '../utils/cn.js';

export function SoundToggle({ className }: { className?: string }) {
  const [muted, setMuted] = useState(isMuted());

  return (
    <button
      type="button"
      data-silent="true"
      onClick={() => {
        unlockAudio();
        const next = toggleMuted();
        setMuted(next);
        if (!next) playSound('notify');
      }}
      className={cn('btn-ghost !p-2.5', className)}
      aria-label={muted ? 'Activer le son' : 'Couper le son'}
      title={muted ? 'Activer le son' : 'Couper le son'}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
