export type RouteStatus = 'active' | 'draft' | 'paused';
export type Difficulty = 'low' | 'medium' | 'high';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type Municipality = 'Sogamoso' | 'Corrales' | 'Tasco' | 'Paz de Río';

export interface OperatorProfile { id?: number; full_name: string; municipality: Municipality; phone: string; rnt_number: string; soporte_rnt_url?: string; bio?: string; verification_status?: 'pending' | 'verified' | 'rejected'; rating?: number; }
export interface Route { id: number; title: string; description: string; municipality?: Municipality; difficulty: Difficulty; duration_hours: number; price_cop: number; location_start: { latitude: number; longitude: number }; route_points: { latitude: number; longitude: number }[]; images: string[]; status: RouteStatus; created_at: string; }
export type RouteInput = Omit<Route, 'id' | 'created_at'>;
export interface Booking { id: number; route_id: number; route_title: string; tourist_email: string; tourist_phone?: string; booking_date: string; preferred_time?: string; num_people: number; visitor_message?: string; special_requirements?: string; status: BookingStatus; total_cop: number; }

interface ApiResponse<T> { code: number; message: string; success: boolean; data?: T; }

class OperatorApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'OperatorApiError'; }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${localStorage.getItem('access_token') ?? ''}`);
  const response = await fetch(url, { ...options, headers });
  const body = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !body?.success || body.data === undefined) throw new OperatorApiError(body?.message ?? 'No fue posible completar la operación.', response.status);
  return body.data;
}

async function requestRoute<T>(url: string, method: 'POST' | 'PATCH', data: RouteInput, images: File[] = []): Promise<T> {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(data));
  images.forEach((image) => formData.append('images', image));
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
    body: formData,
  });
  const body = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !body?.success || body.data === undefined) throw new OperatorApiError(body?.message ?? 'No fue posible completar la operación.', response.status);
  return body.data;
}

export const operatorApi = {
  profile: () => request<OperatorProfile>('/api/operator/profile'),
  saveProfile: (data: OperatorProfile) => request<OperatorProfile>('/api/operator/profile', { method: 'PUT', body: JSON.stringify(data) }),
  routes: () => request<Route[]>('/api/routes'),
  createRoute: (data: RouteInput, images?: File[]) => requestRoute<Route>('/api/routes', 'POST', data, images),
  updateRoute: (id: number, data: RouteInput, images?: File[]) => requestRoute<Route>(`/api/routes/${id}`, 'PATCH', data, images),
  bookings: (bookingDate?: string) => request<Booking[]>(`/api/bookings/operator${bookingDate ? `?booking_date=${encodeURIComponent(bookingDate)}` : ''}`),
  pendingBookings: () => request<Booking[]>('/api/bookings/operator/pending'),
  updateBooking: (id: number, status: BookingStatus) => request<Booking>(`/api/bookings/operator/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
