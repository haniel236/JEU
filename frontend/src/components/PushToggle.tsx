import { useEffect, useState } from 'react';
import { BellRing, BellOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  disablePush,
  enablePush,
  isPushEnabled,
  pushSupported,
} from '../services/push.js';
import { playSound } from '../utils/sound.js';

export function PushToggle() {
  const [supported] = useState(() => pushSupported());
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void isPushEnabled().then((v) => {
      if (active) setEnabled(v);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!supported) {
    return (
      <div className="card mb-4 flex items-center gap-3 p-4">
        <BellOff className="h-5 w-5 shrink-0 text-slate-400" />
        <p className="text-sm text-slate-600">
          Les notifications push ne sont pas disponibles sur ce navigateur. Sur Android, installez
          l'application puis réessayez.
        </p>
      </div>
    );
  }

  const enable = async () => {
    setBusy(true);
    try {
      const result = await enablePush();
      if (result === 'enabled') {
        setEnabled(true);
        playSound('notify');
        toast.success('Notifications activées');
      } else if (result === 'denied') {
        toast.error('Autorisation refusée. Activez-les dans les réglages du navigateur.');
      } else if (result === 'unavailable') {
        toast.error('Notifications push non configurées côté serveur.');
      } else {
        toast.error('Notifications push non prises en charge.');
      }
    } catch {
      toast.error("Impossible d'activer les notifications.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await disablePush();
      setEnabled(false);
      toast('Notifications désactivées');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mb-4 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Notifications push</p>
          <p className="text-sm text-slate-600">
            {enabled
              ? 'Activées — vous recevrez les alertes même l\'application fermée.'
              : 'Recevez les alertes sur votre téléphone, même l\'application fermée.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => (enabled ? void disable() : void enable())}
        disabled={busy}
        className={enabled ? 'btn-secondary sm:ml-auto' : 'btn-primary sm:ml-auto'}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {enabled ? 'Désactiver' : 'Activer les notifications'}
      </button>
    </div>
  );
}
