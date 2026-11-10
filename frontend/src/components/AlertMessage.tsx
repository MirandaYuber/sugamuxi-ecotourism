import { AlertCircle } from 'lucide-react';

export function AlertMessage({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
    <AlertCircle className="mt-0.5 shrink-0" size={17} />
    <span>{message}</span>
  </div>;
}
