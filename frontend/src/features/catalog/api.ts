import type { Experience } from '@/data/experiences';

interface PublicRoute {
  id: number;
  name: string;
  description: string;
  detail: string;
  municipality: string;
  difficulty: 'low' | 'medium' | 'high';
  duration_hours: number;
  price: number;
  location_start: { latitude: number; longitude: number };
  route_points: { latitude: number; longitude: number }[];
  guide_name: string;
}

interface ApiResponse<T> { code: number; message: string; success: boolean; data?: T; }

export class CatalogApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'CatalogApiError'; }
}

const difficultyLabel = { low: 'Baja', medium: 'Media', high: 'Alta' } as const;
const image = (id: number) => `https://images.unsplash.com/photo-${['1464822759023-fed622ff2c3b', '1500534623283-312aade485b7', '1511497584788-876760111969'][id % 3]}?auto=format&fit=crop&w=1200&q=85`;

function mapRoute(route: PublicRoute): Experience {
  return { id: route.id, municipality: route.municipality, name: route.name, description: route.description, detail: route.detail, rating: 0, reviews: 0, price: route.price, difficulty: difficultyLabel[route.difficulty], duration: `${route.duration_hours} horas`, location: route.municipality, guide: { name: route.guide_name, rating: 0, reviews: 0, bio: 'Guía local del corredor Sugamuxi.', avatar: image(route.id) }, images: [image(route.id), image(route.id + 1), image(route.id + 2)], routePoints: route.route_points.length ? route.route_points : [route.location_start] };
}

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !body?.success || body.data === undefined) throw new CatalogApiError(body?.message ?? 'No fue posible cargar el catálogo.', response.status);
  return body.data;
}

export const catalogApi = {
  list: (search?: string, municipality?: string) => { const params = new URLSearchParams(); if (search) params.set('search', search); if (municipality && municipality !== 'Todos') params.set('municipality', municipality); return get<PublicRoute[]>(`/api/public/routes${params.toString() ? `?${params}` : ''}`).then((routes) => routes.map(mapRoute)); },
  detail: (id: string) => get<PublicRoute>(`/api/public/routes/${id}`).then(mapRoute),
};
