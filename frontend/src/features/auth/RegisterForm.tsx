import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertMessage } from '@/components/AlertMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthApiError, registerUser, type AuthRole } from './api';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Ingresa tu nombre completo').max(160, 'El nombre es demasiado largo'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  role: z.enum(['visitor', 'guide']),
}).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden' });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onRegistered }: { onRegistered: (response: Awaited<ReturnType<typeof registerUser>>) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [profileImage, setProfileImage] = useState<File>();
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'visitor' } });
  const onSubmit = async (values: RegisterValues) => {
    setSubmitError('');
    try {
      const response = await registerUser(values.fullName, values.email, values.password, values.role as AuthRole, profileImage);
      onRegistered(response);
    } catch (error) {
      setSubmitError(error instanceof AuthApiError && error.status === 409 ? 'Ya existe una cuenta con ese correo.' : error instanceof Error ? error.message : 'No fue posible crear la cuenta.');
    }
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
    {submitError && <AlertMessage message={submitError} />}
    <div><label htmlFor="register-full-name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nombre completo</label><Input id="register-full-name" autoComplete="name" placeholder="María Fernanda López" className="h-12 rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none dark:border-white/10 dark:bg-slate-950" {...register('fullName')} />{errors.fullName && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.fullName.message}</p>}</div>
    <div><label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Correo electrónico</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input id="register-email" type="email" autoComplete="email" placeholder="tu@correo.com" className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm shadow-none dark:border-white/10 dark:bg-slate-950" {...register('email')} /></div>{errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}</div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de cuenta<select {...register('role')} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"><option value="visitor">Visitante</option><option value="guide">Guía / operador</option></select></label>
    <div><label htmlFor="register-profile-image" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Foto de perfil <span className="font-normal text-slate-400">(opcional)</span></label><Input id="register-profile-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setProfileImage(event.target.files?.[0])} className="h-auto rounded-xl border-slate-200 bg-slate-50 py-3 text-sm dark:border-white/10 dark:bg-slate-950" /><p className="mt-1 text-xs font-normal text-slate-500 dark:text-slate-400">JPG, PNG, WEBP o GIF; máximo 5 MB.</p></div>
    <div><label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Contraseña</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 pr-12 text-sm shadow-none dark:border-white/10 dark:bg-slate-950" {...register('password')} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}</div>
    <div><label htmlFor="register-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Confirmar contraseña</label><div className="relative"><Input id="register-confirm-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••" className="h-12 rounded-xl border-slate-200 bg-slate-50 pr-12 text-sm shadow-none dark:border-white/10 dark:bg-slate-950" {...register('confirmPassword')} /><button type="button" onClick={() => setShowConfirmation((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label={showConfirmation ? 'Ocultar confirmación' : 'Mostrar confirmación'}>{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>}</div>
    <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl bg-green-800 font-semibold shadow-lg shadow-green-900/15 hover:bg-green-900">{isSubmitting ? <><LoaderCircle className="mr-2 animate-spin" size={18} />Creando cuenta...</> : <>Crear cuenta <ArrowRight className="ml-2" size={18} /></>}</Button>
  </form>;
}
