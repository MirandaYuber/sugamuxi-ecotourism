export type VisitorBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface VisitorBooking {
  id: number;
  experience_id: number;
  experience_name: string;
  municipality: string;
  booking_date: string;
  preferred_time: string;
  num_people: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string;
  special_requirements?: string;
  total_cop: number;
  status: VisitorBookingStatus;
  created_at: string;
}

interface VisitorBookingApiResponse {
  id: number;
  route_id: number;
  experience_id: number;
  experience_name: string;
  booking_date: string;
  num_people: number;
  status: VisitorBookingStatus;
  total_cop: number;
  visitor_email: string;
  preferred_time: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_message?: string;
  special_requirements?: string;
}

export interface CreateVisitorBookingInput {
  experience_id: number;
  booking_date: string;
  preferred_time: string;
  num_people: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string;
  special_requirements?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data?: T;
}

export class VisitorApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'VisitorApiError';
  }
}

function mapBooking(booking: VisitorBookingApiResponse): VisitorBooking {
  return { id: booking.id, experience_id: booking.experience_id, experience_name: booking.experience_name, municipality: '—', booking_date: booking.booking_date.slice(0, 10), preferred_time: booking.preferred_time, num_people: booking.num_people, visitor_name: booking.visitor_name, visitor_email: booking.visitor_email, visitor_phone: booking.visitor_phone, visitor_message: booking.visitor_message, special_requirements: booking.special_requirements, total_cop: booking.total_cop, status: booking.status, created_at: booking.booking_date };
}

export const visitorApi = {
  list: async (): Promise<VisitorBooking[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new VisitorApiError('Debes iniciar sesión para consultar tus reservas.', 401);
    const response = await fetch('/api/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => null) as ApiResponse<VisitorBookingApiResponse[]> | null;
    if (!response.ok || !body?.success || !body.data) {
      throw new VisitorApiError(body?.message ?? 'No fue posible consultar tus reservas.', response.status);
    }
    return body.data.map(mapBooking);
  },
  create: async (data: CreateVisitorBookingInput): Promise<VisitorBooking> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new VisitorApiError('Debes iniciar sesión para enviar una solicitud.', 401);
    const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ route_id: data.experience_id, booking_date: data.booking_date, preferred_time: data.preferred_time, num_people: data.num_people, visitor_name: data.visitor_name, visitor_phone: data.visitor_phone, visitor_message: data.visitor_message, special_requirements: data.special_requirements }) });
    const body = await response.json().catch(() => null) as ApiResponse<VisitorBookingApiResponse> | null;
    if (!response.ok || !body?.success || !body.data) throw new VisitorApiError(body?.message ?? 'No fue posible enviar la solicitud.', response.status);
    return mapBooking(body.data);
  },
  cancel: async (id: number): Promise<VisitorBooking> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new VisitorApiError('Debes iniciar sesión para cancelar una reserva.', 401);
    const response = await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => null) as ApiResponse<VisitorBookingApiResponse> | null;
    if (!response.ok || !body?.success || !body.data) throw new VisitorApiError(body?.message ?? 'No fue posible cancelar la reserva.', response.status);
    return mapBooking(body.data);
  },
};
