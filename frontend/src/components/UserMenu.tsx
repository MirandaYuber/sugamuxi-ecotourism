import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VisitorBookingsModal } from '@/features/visitor/VisitorBookingsModal';

export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const role = localStorage.getItem('user_role');
  const isOperator = role === 'operator';
  if (!localStorage.getItem('access_token')) return <Link to="/login" className="flex items-center gap-2 rounded-full border border-green-800/15 bg-white px-4 py-2 text-sm font-semibold text-green-900 transition hover:border-green-800/40 hover:bg-green-50 dark:border-white/15 dark:bg-slate-900 dark:text-green-300 dark:hover:bg-slate-800"><UserRound size={16} /> <span className="hidden sm:inline">Ingresar</span></Link>;
  const logout = () => { localStorage.removeItem('access_token'); localStorage.removeItem('user_role'); navigate('/'); };
  return <div className="relative"><button type="button" onClick={() => setOpen((current) => !current)} className="flex items-center gap-2 rounded-full border border-green-800/15 bg-white px-3 py-2 text-sm font-semibold text-green-900 dark:border-white/15 dark:bg-slate-900 dark:text-green-300" aria-expanded={open}><UserRound size={16} /><span className="hidden sm:inline">{isOperator ? 'Guía' : 'Visitante'}</span><ChevronDown size={15} /></button>{open && <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900"><Link to="/operator/dashboard" onClick={() => setOpen(false)} className={`${isOperator ? 'block' : 'hidden'} rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800`}>Panel del guía</Link>{!isOperator && <button type="button" onClick={() => { setOpen(false); setShowBookings(true); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Mis reservas</button>}<button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"><LogOut size={15} /> Cerrar sesión</button></div>}{showBookings && <VisitorBookingsModal onClose={() => setShowBookings(false)} />}</div>;
}
