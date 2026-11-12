import { ArrowLeft, Check, MapPin, Mountain, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { RegisterForm } from '@/features/auth/RegisterForm';
import type { AuthResponse } from '@/features/auth/api';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleRegistered = (result: AuthResponse) => {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('user_role', result.user.role === 'guide' ? 'operator' : 'visitor');
    localStorage.setItem('user_name', result.user.full_name);
    if (result.user.profile_image_url) localStorage.setItem('user_profile_image', result.user.profile_image_url);
    navigate(searchParams.get('returnTo') ?? (result.user.role === 'guide' ? '/operator/dashboard' : '/'));
  };
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f3] px-5 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8 sm:py-10">
      <div className="flex justify-end"><ThemeToggle /></div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <section className="my-auto grid overflow-hidden rounded-[2rem] border border-green-950/10 bg-white shadow-2xl shadow-green-950/10 dark:border-white/10 dark:bg-slate-900 lg:min-h-[650px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative isolate overflow-hidden bg-green-950 px-7 py-10 text-white sm:px-12 sm:py-14 lg:px-14 lg:py-16">
            <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-green-700/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <MapPin size={22} />
              </span>
              <span className="text-lg font-bold tracking-tight">Sugamuxi <span className="font-medium text-emerald-300">Ecoturismo</span></span>
            </div>

            <div className="mt-16 max-w-md lg:mt-24">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Espacio para anfitriones</p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Haz que tu territorio sea inolvidable.</h1>
              <p className="mt-5 text-base leading-7 text-green-100/75">Administra tus experiencias, conecta con viajeros y comparte lo mejor de Boyacá desde un solo lugar.</p>
            </div>

            <ul className="mt-10 space-y-4 text-sm text-green-50/90">
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"><Check size={15} /></span>Gestiona tus rutas y experiencias</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"><Check size={15} /></span>Organiza tus reservas fácilmente</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"><Check size={15} /></span>Haz crecer tu comunidad de viajeros</li>
            </ul>

            <Mountain className="absolute bottom-8 right-8 text-white/10" size={120} strokeWidth={1} />
          </div>

          <div className="relative flex items-center px-7 py-16 sm:px-12 sm:py-14 lg:px-16">
            <Link to="/" className="absolute right-7 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-green-700 dark:text-slate-400 dark:hover:text-green-300 sm:right-12 lg:right-16">
              <ArrowLeft size={16} />
              Inicio
            </Link>
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
                  <ShieldCheck size={25} />
                </div>
              <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">Acceso para visitantes y guías</p>
                <h2 className="text-3xl font-bold tracking-tight text-green-950 dark:text-white">{isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{isRegistering ? 'Regístrate para descubrir experiencias o administrar tus rutas.' : 'Ingresa para gestionar tus reservas o administrar tus experiencias.'}</p>
              </div>
              {isRegistering ? <RegisterForm onRegistered={handleRegistered} /> : <LoginForm />}
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'} <button type="button" onClick={() => setIsRegistering((current) => !current)} className="font-semibold text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">{isRegistering ? 'Iniciar sesión' : 'Registrarme'}</button></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
