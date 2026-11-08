import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardPage() { return <main className="min-h-screen bg-[#f7f8f3] p-6 dark:bg-slate-950"><div className="mx-auto flex max-w-5xl justify-end"><ThemeToggle /></div><div className="mx-auto max-w-5xl"><h1 className="text-2xl font-bold text-green-800 dark:text-green-300">Panel de reservas</h1><p className="mt-2 text-slate-600 dark:text-slate-400">Área privada del viajero.</p></div></main>; }
