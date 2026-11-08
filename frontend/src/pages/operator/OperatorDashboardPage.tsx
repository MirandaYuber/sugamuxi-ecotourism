import { CalendarDays, CheckCircle2, CircleDollarSign, Compass, Route as RouteIcon, Star, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { operatorApi, type Booking, type OperatorProfile, type Route } from '@/features/operator/api';

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export function OperatorDashboardPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([operatorApi.routes(), operatorApi.bookings(), operatorApi.profile()]).then(([routeItems, bookingItems, profileItem]) => { setRoutes(routeItems); setBookings(bookingItems); setProfile(profileItem); }).catch((e) => setError(e.message)); }, []);
  const active = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status)).length;
  const pending = bookings.filter((booking) => booking.status === 'pending').length;
  const activeRoutes = routes.filter((route) => route.status === 'active').length;
  const upcoming = bookings.filter((booking) => new Date(booking.booking_date) >= new Date() && ['confirmed', 'pending'].includes(booking.status)).sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())[0];
  const income = bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status)).reduce((sum, booking) => sum + booking.total_cop, 0);
  const next = routes.find((route) => route.status === 'active');
  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'Sin guianzas';
  const metrics = [{ Icon: CalendarDays, label: 'Reservas activas', value: active.toString() }, { Icon: Compass, label: 'Próxima ruta', value: next?.title ?? 'Sin rutas activas' }, { Icon: CheckCircle2, label: 'Solicitudes pendientes', value: pending.toString() }, { Icon: RouteIcon, label: 'Rutas activas', value: activeRoutes.toString() }, { Icon: CalendarDays, label: 'Próxima guianza', value: formatDate(upcoming?.booking_date) }, { Icon: CircleDollarSign, label: 'Ingresos registrados', value: money(income) }, { Icon: Star, label: 'Valoración promedio', value: profile?.rating ? `${profile.rating.toFixed(1)} / 5` : 'Sin datos' }, { Icon: UserCheck, label: 'Estado RNT', value: profile?.verification_status === 'verified' ? 'Verificado' : 'Pendiente' }];
  return <section className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500 dark:text-slate-400">Buenos días, operador</p><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Resumen de actividad</h2></div><span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-sm font-semibold text-green-800 dark:bg-green-950 dark:text-green-300"><CheckCircle2 size={17} /> Guía verificado (RNT activo)</span></div>{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(({ Icon, label, value }) => <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900" key={label}><div className="mb-4 flex items-center justify-between gap-3 text-green-700 dark:text-green-400"><span className="text-sm text-slate-500 dark:text-slate-400">{label}</span><Icon size={20} className="shrink-0" /></div><p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p></div>)}</div><div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-5 dark:border-green-900/60 dark:bg-green-950/40"><h3 className="font-semibold text-green-900 dark:text-green-200">Tu operación está lista</h3><p className="mt-1 text-sm text-green-800 dark:text-green-300">Mantén actualizado tu RNT y responde las solicitudes para mejorar la experiencia de tus viajeros.</p></div></section>;
}
