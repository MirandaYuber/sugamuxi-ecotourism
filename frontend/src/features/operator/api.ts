export type RouteStatus = 'active' | 'draft' | 'paused';
export type Difficulty = 'low' | 'medium' | 'high';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type Municipality = 'Sogamoso' | 'Corrales' | 'Tasco' | 'Paz de Río';

export interface OperatorProfile { id?: number; full_name: string; municipality: Municipality; phone: string; rnt_number: string; soporte_rnt_url?: string; bio?: string; verification_status?: 'pending' | 'verified' | 'rejected'; }
export interface Route { id: number; title: string; description: string; difficulty: Difficulty; duration_hours: number; price_cop: number; location_start: { latitude: number; longitude: number }; route_points: { latitude: number; longitude: number }[]; status: RouteStatus; created_at: string; }
export type RouteInput = Omit<Route, 'id' | 'created_at'>;
export interface Booking { id: number; route_id: number; route_title: string; tourist_email: string; booking_date: string; num_people: number; status: BookingStatus; total_cop: number; }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`, ...init.headers } });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? 'No se pudo completar la solicitud');
  return response.json();
}
export const operatorApi = {
  profile: () => request<OperatorProfile>('/operator/profile'),
  saveProfile: (data: OperatorProfile) => request<OperatorProfile>('/operator/profile', { method: 'POST', body: JSON.stringify(data) }),
  routes: () => request<Route[]>('/operator/routes'),
  createRoute: (data: RouteInput) => request<Route>('/operator/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id: number, data: RouteInput) => request<Route>(`/operator/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  bookings: () => request<Booking[]>('/operator/bookings'),
  updateBooking: (id: number, status: BookingStatus) => request<Booking>(`/operator/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
