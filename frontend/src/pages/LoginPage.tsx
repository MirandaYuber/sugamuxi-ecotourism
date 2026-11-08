import { Link } from 'react-router-dom';
import { LoginForm } from '@/features/auth/LoginForm';
export function LoginPage() { return <main className="mx-auto max-w-md p-6"><Link className="mb-6 block text-green-800" to="/">← Volver al inicio</Link><h1 className="mb-4 text-2xl font-bold">Ingresa a tu cuenta</h1><LoginForm /></main>; }
