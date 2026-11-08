export type RouteStatus = 'active' | 'draft' | 'paused';
export type Difficulty = 'low' | 'medium' | 'high';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type Municipality = 'Sogamoso' | 'Corrales' | 'Tasco' | 'Paz de Río';

export interface OperatorProfile { id?: number; full_name: string; municipality: Municipality; phone: string; rnt_number: string; soporte_rnt_url?: string; bio?: string; verification_status?: 'pending' | 'verified' | 'rejected'; rating?: number; }
export interface Route { id: number; title: string; description: string; municipality?: Municipality; difficulty: Difficulty; duration_hours: number; price_cop: number; location_start: { latitude: number; longitude: number }; route_points: { latitude: number; longitude: number }[]; status: RouteStatus; created_at: string; }
export type RouteInput = Omit<Route, 'id' | 'created_at'>;
export interface Booking { id: number; route_id: number; route_title: string; tourist_email: string; tourist_phone?: string; booking_date: string; preferred_time?: string; num_people: number; visitor_message?: string; special_requirements?: string; status: BookingStatus; total_cop: number; }

const STORAGE_KEY = 'sugamuxi_operator_mock';

type MockStore = { profile: OperatorProfile; routes: Route[]; bookings: Booking[] };

const initialStore: MockStore = {
  profile: {
    full_name: 'María Fernanda López', municipality: 'Sogamoso', phone: '304 453 2134',
    rnt_number: 'RNT-BOY-00482', soporte_rnt_url: '',
    bio: 'Guía local especializada en senderismo y experiencias de naturaleza.', verification_status: 'verified', rating: 4.9,
  },
  routes: [
    { id: 1, title: 'Sendero Laguna de Tota', description: 'Recorrido guiado por paisajes de montaña y cultivos tradicionales.', municipality: 'Sogamoso', difficulty: 'medium', duration_hours: 4, price_cop: 85000, location_start: { latitude: 5.52, longitude: -73.0 }, route_points: [{ latitude: 5.52, longitude: -73.0 }, { latitude: 5.54, longitude: -72.98 }], status: 'active', created_at: '2026-01-15T10:00:00Z' },
    { id: 2, title: 'Cañón del Chicamocha Verde', description: 'Experiencia de caminata y observación de aves.', municipality: 'Paz de Río', difficulty: 'low', duration_hours: 3, price_cop: 65000, location_start: { latitude: 5.72, longitude: -72.93 }, route_points: [], status: 'draft', created_at: '2026-02-03T10:00:00Z' },
  ],
  bookings: [
    { id: 1, route_id: 1, route_title: 'Sendero Laguna de Tota', tourist_email: 'carlos.mejia@email.com', tourist_phone: '310 555 0182', booking_date: '2026-11-14T09:00:00Z', preferred_time: '8:00 a. m.', num_people: 3, visitor_message: 'Queremos celebrar un cumpleaños y conocer los mejores miradores de la laguna.', special_requirements: 'Una persona del grupo es vegetariana.', status: 'pending', total_cop: 255000 },
    { id: 2, route_id: 1, route_title: 'Sendero Laguna de Tota', tourist_email: 'laura.gomez@email.com', tourist_phone: '315 442 9011', booking_date: '2026-11-21T08:30:00Z', preferred_time: '7:30 a. m.', num_people: 2, visitor_message: 'Buscamos una experiencia tranquila para disfrutar en pareja.', status: 'confirmed', total_cop: 170000 },
    { id: 3, route_id: 2, route_title: 'Cañón del Chicamocha Verde', tourist_email: 'andres.ruiz@email.com', tourist_phone: '300 778 2330', booking_date: '2026-12-02T10:00:00Z', preferred_time: '9:00 a. m.', num_people: 4, visitor_message: 'Nos interesa especialmente la observación de aves y la fotografía.', special_requirements: 'Llevaremos equipo fotográfico.', status: 'pending', total_cop: 260000 },
  ],
};

function readStore(): MockStore {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
    return structuredClone(initialStore);
  }
  const store = JSON.parse(saved) as MockStore;
  store.profile = { ...initialStore.profile, ...store.profile };
  // Completa reservas creadas por versiones anteriores del mock con los nuevos datos de contacto.
  store.bookings = store.bookings.map((booking) => {
    const seed = initialStore.bookings.find((item) => item.id === booking.id);
    return seed ? { ...seed, ...booking } : booking;
  });
  writeStore(store);
  return store;
}

function writeStore(store: MockStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

const delay = <T,>(value: T): Promise<T> => Promise.resolve(structuredClone(value));

export const operatorApi = {
  profile: () => delay(readStore().profile),
  saveProfile: (data: OperatorProfile) => { const store = readStore(); store.profile = { ...store.profile, ...data }; writeStore(store); return delay(store.profile); },
  routes: () => delay(readStore().routes),
  createRoute: (data: RouteInput) => { const store = readStore(); const route = { ...data, id: Date.now(), created_at: new Date().toISOString() }; store.routes = [route, ...store.routes]; writeStore(store); return delay(route); },
  updateRoute: (id: number, data: RouteInput) => { const store = readStore(); const route = { ...data, id, created_at: store.routes.find((item) => item.id === id)?.created_at ?? new Date().toISOString() }; store.routes = store.routes.map((item) => item.id === id ? route : item); writeStore(store); return delay(route); },
  bookings: () => delay(readStore().bookings),
  updateBooking: (id: number, status: BookingStatus) => { const store = readStore(); const booking = store.bookings.find((item) => item.id === id); if (!booking) return Promise.reject(new Error('Reserva no encontrada')); booking.status = status; writeStore(store); return delay(booking); },
};
