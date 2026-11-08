import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({ email: z.string().email('Ingresa un correo válido'), password: z.string().min(8, 'Mínimo 8 caracteres') });
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<'visitor' | 'operator'>('visitor');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (values: LoginValues) => {
    setSubmitError('');
    // Acceso local temporal mientras el catálogo y la autenticación sigan siendo estáticos.
    localStorage.setItem('access_token', `demo-${role}-session:${values.email}`);
    localStorage.setItem('user_role', role);
    navigate(searchParams.get('returnTo') ?? (role === 'operator' ? '/operator/dashboard' : '/'));
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
    {submitError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="mt-0.5 shrink-0" size={17} /><span>{submitError}</span></div>}
    <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">¿Qué tipo de cuenta tienes?</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRole('visitor')} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${role === 'visitor' ? 'border-green-700 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400'}`}>Soy visitante</button><button type="button" onClick={() => setRole('operator')} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${role === 'operator' ? 'border-green-700 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400'}`}>Soy guía</button></div></fieldset>
    <div>
      <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Correo electrónico</label>
      <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input id="email" type="email" autoComplete="email" placeholder="guia@ejemplo.com" className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm shadow-none transition focus:border-green-700 focus:ring-4 focus:ring-green-700/10 dark:border-white/10 dark:bg-slate-950" {...register('email')} /></div>
      {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Contraseña</label><button type="button" className="text-xs font-semibold text-green-700 hover:text-green-800 dark:text-green-400" onClick={() => setSubmitError('La recuperación de contraseña estará disponible próximamente.')}>¿Olvidaste tu contraseña?</button></div>
      <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 pr-12 text-sm shadow-none transition focus:border-green-700 focus:ring-4 focus:ring-green-700/10 dark:border-white/10 dark:bg-slate-950" {...register('password')} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
      {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
    </div>
    <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl bg-green-800 font-semibold shadow-lg shadow-green-900/15 hover:bg-green-900">
      {isSubmitting ? <><LoaderCircle className="mr-2 animate-spin" size={18} />Ingresando...</> : <>Ingresar al panel <ArrowRight className="ml-2" size={18} /></>}
    </Button>
  </form>;
}
