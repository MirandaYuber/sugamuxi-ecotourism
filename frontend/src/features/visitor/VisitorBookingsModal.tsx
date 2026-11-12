import { CalendarDays, ClipboardList, Clock3, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertMessage } from '@/components/AlertMessage';
import { visitorApi, type VisitorBooking, type VisitorBookingStatus } from './api';

const statusStyles: Record<VisitorBookingStatus, string> = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300', rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', completed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
const statusLabel: Record<VisitorBookingStatus, string> = { pending: 'Pendiente', confirmed: 'Confirmada', rejected: 'Rechazada', cancelled: 'Cancelada', completed: 'Completada' };

export function VisitorBookingsModal({ onClose }: { onClose: () => void }) {
  const [bookings, setBookings] = useState<VisitorBooking[]>([]);
  const [filter, setFilter] = useState<VisitorBookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  useEffect(() => {
    visitorApi.list().then(setBookings).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible consultar tus reservas.')).finally(() => setLoading(false));
  }, []);
  const visible = filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter);
  const cancelBooking = async (booking: VisitorBooking) => {
    if (booking.status !== 'pending' || !window.confirm('¿Quieres cancelar esta solicitud de reserva?')) return;
    setError('');
    setCancellingId(booking.id);
    try {
      const cancelled = await visitorApi.cancel(booking.id);
      setBookings((current) => current.map((item) => item.id === cancelled.id ? cancelled : item));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No fue posible cancelar la reserva.');
    } finally {
      setCancellingId(null);
    }
  };
  return <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="visitor-bookings-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-green-700 dark:text-green-400">Área del visitante</p><h2 id="visitor-bookings-title" className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Mis reservas</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Cerrar mis reservas"><X size={20} /></button></div>{error && <div className="mt-6"><AlertMessage message={error} /></div>}{loading ? <div className="py-10 text-center text-sm text-slate-500">Cargando tus reservas...</div> : <><div className="mt-6 flex gap-2 overflow-x-auto pb-2">{(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${filter === value ? 'bg-green-800 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{value === 'all' ? 'Todas' : statusLabel[value]}</button>)}</div><div className="mt-2 space-y-4">{visible.map((booking) => <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-800"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white">{booking.experience_name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}>{statusLabel[booking.status]}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><MapPin size={14} /> {booking.municipality}</p></div><strong className="text-green-800 dark:text-green-300">${booking.total_cop.toLocaleString('es-CO')} COP</strong></div><div className="mt-4 grid gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300 sm:grid-cols-3"><span className="flex items-center gap-2"><CalendarDays size={15} />{new Date(`${booking.booking_date}T12:00:00`).toLocaleDateString('es-CO')}</span><span className="flex items-center gap-2"><Clock3 size={15} />{booking.preferred_time}</span><span className="flex items-center gap-2"><ClipboardList size={15} />{booking.num_people} personas</span></div>{booking.status === 'pending' && <button type="button" onClick={() => cancelBooking(booking)} disabled={cancellingId === booking.id} className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">{cancellingId === booking.id ? 'Cancelando...' : 'Cancelar solicitud'}</button>}</article>)}{visible.length === 0 && <div className="py-10 text-center"><ClipboardList className="mx-auto text-slate-400" size={40} /><p className="mt-3 font-semibold text-slate-800 dark:text-white">No hay reservas en este estado</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prueba con otro filtro.</p></div>}</div></>}</section></div>;
}
