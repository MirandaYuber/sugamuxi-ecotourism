import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { operatorApi, type Booking, type BookingStatus } from '@/features/operator/api';

const statuses: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'completed', label: 'Completadas' },
];

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
};

const statusLabel = (value: string) => ({ pending: 'Pendiente', confirmed: 'Confirmada', rejected: 'Rechazada', cancelled: 'Cancelada', completed: 'Completada' }[value] ?? value);

export function OperatorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    operatorApi.bookings().then(setBookings).catch((e) => setError(e.message));
  }, []);

  const change = async (id: number, status: BookingStatus) => {
    try {
      const updated = await operatorApi.updateBooking(id, status);
      setBookings((current) => current.map((booking) => booking.id === id ? updated : booking));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const visible = filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter);

  return <section className="mx-auto max-w-6xl">
    <div className="mb-6"><p className="text-sm text-green-700 dark:text-green-400">Atención al viajero</p><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Solicitudes de reserva</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Revisa y gestiona las solicitudes de tus experiencias.</p></div>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar reservas por estado">{statuses.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item.value ? 'bg-green-700 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-green-50 hover:text-green-800 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/15 dark:hover:bg-slate-800 dark:hover:text-green-300'}`}>{item.label}</button>)}</div>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
    <div className="space-y-3">
      {visible.map((booking) => <article key={booking.id} className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{booking.route_title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}>{statusLabel(booking.status)}</span></div><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{booking.tourist_email} · {booking.num_people} personas · {new Date(booking.booking_date).toLocaleDateString('es-CO')}</p><p className="mt-1 text-sm font-semibold text-green-800 dark:text-green-300">${booking.total_cop.toLocaleString('es-CO')} COP</p></div>
        {booking.status === 'pending' && <div className="flex shrink-0 gap-2"><Button type="button" onClick={() => change(booking.id, 'confirmed')} className="gap-1.5"><Check size={16} /> Confirmar</Button><Button type="button" variant="outline" onClick={() => change(booking.id, 'rejected')} className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"><X size={16} /> Rechazar</Button></div>}
      </article>)}
    </div>
    {visible.length === 0 && <div className="rounded-xl border border-dashed bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-white">No hay reservas en este estado</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Las nuevas solicitudes aparecerán aquí.</p></div>}
  </section>;
}
