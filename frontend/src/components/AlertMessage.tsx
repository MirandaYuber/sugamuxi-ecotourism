import { AlertCircle, X } from 'lucide-react';

export function AlertMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return <div role="alert" aria-live="assertive" className="fixed right-4 top-4 z-[100] flex w-[min(calc(100vw-2rem),24rem)] items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-xl dark:border-red-900/60 dark:bg-slate-900 dark:text-red-300">
    <AlertCircle className="mt-0.5 shrink-0" size={18} />
    <span className="flex-1">{message}</span>
    {onClose && <button type="button" onClick={onClose} className="rounded-md p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label="Cerrar notificación"><X size={16} /></button>}
  </div>;
}
