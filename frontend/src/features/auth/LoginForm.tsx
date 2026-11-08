import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({ email: z.string().email('Ingresa un correo válido'), password: z.string().min(8, 'Mínimo 8 caracteres') });
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (values: LoginValues) => {
    const body = new URLSearchParams({ username: values.email, password: values.password });
    const response = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) throw new Error('Credenciales incorrectas');
    const token: { access_token: string } = await response.json();
    localStorage.setItem('access_token', token.access_token);
    navigate('/dashboard');
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow">
    <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Correo</label><Input id="email" type="email" autoComplete="email" {...register('email')} />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}</div>
    <div><label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label><Input id="password" type="password" autoComplete="current-password" {...register('password')} />{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}</div>
    <Button type="submit" disabled={isSubmitting} className="w-full">Ingresar</Button>
  </form>;
}
