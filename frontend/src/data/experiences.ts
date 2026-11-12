export interface Experience {
  id: number;
  municipality: string;
  name: string;
  description: string;
  detail: string;
  rating: number;
  reviews: number;
  price: number;
  difficulty: 'Baja' | 'Media' | 'Alta';
  duration: string;
  location: string;
  guide: { name: string; rating: number; reviews: number; bio: string; avatar: string };
  images: string[];
  routePoints: { latitude: number; longitude: number }[];
}

export const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;
