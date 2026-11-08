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

const STORAGE_KEY = 'sugamuxi_visitor_bookings';

function readBookings(): VisitorBooking[] { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as VisitorBooking[] : []; }
function writeBookings(bookings: VisitorBooking[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)); }

export const visitorApi = {
  list: () => Promise.resolve(readBookings()),
  create: (data: Omit<VisitorBooking, 'id' | 'status' | 'created_at'>) => { const booking: VisitorBooking = { ...data, id: Date.now(), status: 'pending', created_at: new Date().toISOString() }; const bookings = [booking, ...readBookings()]; writeBookings(bookings); return Promise.resolve(booking); },
  cancel: (id: number) => { const bookings = readBookings().map((booking) => booking.id === id && booking.status === 'pending' ? { ...booking, status: 'cancelled' as const } : booking); writeBookings(bookings); return Promise.resolve(bookings.find((booking) => booking.id === id)); },
};
