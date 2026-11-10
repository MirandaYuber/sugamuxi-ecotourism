import { AlertCircle, X } from 'lucide-react';

export function AlertMessage({ message, variant = 'error', onClose }: { message: string; variant?: 'error' | 'success'; onClose?: () => void }) {
  const isSuccess = variant === 'success';
  return <div role="alert" aria-live="assertive" className={`fixed right-4 top-4 z-[100] flex w-[min(calc(100vw-2rem),24rem)] items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-xl dark:bg-slate-900 ${isSuccess ? 'border-green-200 text-green-700 dark:border-green-900/60 dark:text-green-300' : 'border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-300'}`}>
    <AlertCircle className="mt-0.5 shrink-0" size={18} />
    <span className="flex-1">{message}</span>
    {onClose && <button type="button" onClick={onClose} className={`rounded-md p-1 ${isSuccess ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'}`} aria-label="Cerrar notificación"><X size={16} /></button>}
  </div>;
}
