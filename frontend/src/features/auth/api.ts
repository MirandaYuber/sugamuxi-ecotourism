export type AuthRole = 'visitor' | 'guide';

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data?: T;
}

export class AuthApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AuthApiError('El servidor tardó demasiado en responder.', 408);
    }
    throw new AuthApiError('No fue posible conectarse con el servidor.', 0);
  } finally {
    window.clearTimeout(timeoutId);
  }

  const body = await response.json().catch(() => null) as ApiResponse<AuthResponse> | null;
  if (!response.ok) {
    throw new AuthApiError(body?.message ?? 'No fue posible iniciar sesión.', response.status);
  }

  if (!body?.success || !body.data) {
    throw new AuthApiError(body?.message ?? 'La respuesta del servidor no es válida.', body?.code ?? response.status);
  }
  return body.data;
}
