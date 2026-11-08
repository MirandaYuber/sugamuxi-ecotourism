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

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const experiences: Experience[] = [
  {
    id: 1, municipality: 'Paz de Río', name: 'Sendero de los Frailejones',
    description: 'Camina entre montañas, niebla y paisajes únicos de los páramos boyacenses.',
    detail: 'Una experiencia para desconectarte del ruido y caminar al ritmo de la montaña. Durante el recorrido conocerás la importancia de los frailejones para el ecosistema, visitarás miradores naturales y compartirás una bebida caliente preparada por familias de la zona.',
    rating: 4.9, reviews: 38, price: 85000, difficulty: 'Media', duration: '5 horas', location: 'Páramo de Paz de Río, Boyacá',
    guide: { name: 'María Fernanda López', rating: 4.9, reviews: 42, bio: 'Guía local y defensora de los ecosistemas de alta montaña. Conoce cada sendero del corredor Sugamuxi.', avatar: image('photo-1494790108377-be9c29b29330') }, routePoints: [{ latitude: 5.72, longitude: -72.93 }, { latitude: 5.725, longitude: -72.922 }, { latitude: 5.732, longitude: -72.918 }],
    images: [image('photo-1464822759023-fed622ff2c3b'), image('photo-1500534623283-312aade485b7'), image('photo-1511497584788-876760111969')],
  },
  {
    id: 2, municipality: 'Sogamoso', name: 'Sabores de la Tierra',
    description: 'Descubre los ingredientes y las historias detrás de la cocina campesina local.',
    detail: 'Conoce una cocina de tradición, visita una huerta familiar y prepara junto a nuestros anfitriones una receta típica de la región. Una experiencia para compartir en familia y descubrir el territorio a través de sus sabores.',
    rating: 4.8, reviews: 24, price: 65000, difficulty: 'Baja', duration: '3 horas', location: 'Vereda La Playa, Sogamoso',
    guide: { name: 'Jorge Eliécer Rojas', rating: 4.8, reviews: 29, bio: 'Emprendedor rural que convierte los productos de su finca en historias para compartir.', avatar: image('photo-1507003211169-0a1dd7228f2d') }, routePoints: [{ latitude: 5.715, longitude: -72.925 }, { latitude: 5.72, longitude: -72.918 }, { latitude: 5.724, longitude: -72.91 }],
    images: [image('photo-1504674900247-0877df9cc836'), image('photo-1498837167922-ddd27525d352'), image('photo-1547592180-85f173990554')],
  },
  {
    id: 3, municipality: 'Tasco', name: 'Aventura en el Cañón',
    description: 'Una ruta para respirar profundo, conectar con la naturaleza y vivir el territorio.',
    detail: 'Recorre un paisaje de contrastes entre formaciones rocosas, agua y bosque andino. El recorrido combina interpretación ambiental, fotografía y momentos de contemplación en uno de los paisajes más especiales de Tasco.',
    rating: 5.0, reviews: 19, price: 110000, difficulty: 'Alta', duration: '7 horas', location: 'Cañón de Chicamocha, Tasco',
    guide: { name: 'Andrés Camilo Pérez', rating: 5.0, reviews: 21, bio: 'Montañista y guía certificado, apasionado por la aventura responsable y la educación ambiental.', avatar: image('photo-1500648767791-00dcc994a43e') }, routePoints: [{ latitude: 5.735, longitude: -72.96 }, { latitude: 5.742, longitude: -72.952 }, { latitude: 5.748, longitude: -72.945 }],
    images: [image('photo-1441974231531-c6227db76b6e'), image('photo-1469474968028-56623f02e42e'), image('photo-1500534623283-312aade485b7')],
  },
  {
    id: 4, municipality: 'Corrales', name: 'Pueblos con memoria',
    description: 'Recorre calles llenas de historia y conoce las tradiciones de sus habitantes.',
    detail: 'Una caminata tranquila por la memoria de Corrales. Escucha relatos de sus habitantes, conoce la arquitectura local y termina con una degustación de productos elaborados por emprendimientos de la comunidad.',
    rating: 4.7, reviews: 31, price: 55000, difficulty: 'Baja', duration: '2 horas', location: 'Centro histórico de Corrales',
    guide: { name: 'Diana Marcela Vargas', rating: 4.7, reviews: 35, bio: 'Gestora cultural y narradora local. Su especialidad son las historias que hacen único a cada pueblo.', avatar: image('photo-1438761681033-6461ffad8d80') }, routePoints: [{ latitude: 5.83, longitude: -72.84 }, { latitude: 5.834, longitude: -72.835 }, { latitude: 5.838, longitude: -72.83 }],
    images: [image('photo-1500534623283-312aade485b7'), image('photo-1518005020951-eccb494ad742'), image('photo-1526772662000-3f88f10405ff')],
  },
];

export const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`;
export const getExperience = (id: string | undefined) => experiences.find((experience) => experience.id === Number(id));
