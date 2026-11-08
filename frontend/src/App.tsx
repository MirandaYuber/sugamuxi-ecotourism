import { ArrowRight, MapPin, Search, Star, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';
import { experiences, formatPrice } from '@/data/experiences';
import { ThemeToggle } from '@/components/ThemeToggle';

const municipalities = ['Todos', 'Sogamoso', 'Corrales', 'Tasco', 'Paz de Río'];

export function App() {
  const { query, setQuery } = useSearchStore();
  const [municipality, setMunicipality] = useState('Todos');
  const filteredExperiences = useMemo(() => experiences.filter((experience) => {
    const matchesMunicipality = municipality === 'Todos' || experience.municipality === municipality;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || `${experience.name} ${experience.description} ${experience.municipality}`.toLowerCase().includes(search);
    return matchesMunicipality && matchesQuery;
  }), [municipality, query]);

  return (
    <main className="min-h-screen bg-[#f7f8f3] transition-colors dark:bg-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3 text-green-950" aria-label="Ir al inicio">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-800 text-white shadow-lg shadow-green-900/10">
            <MapPin size={23} strokeWidth={2.2} />
          </span>
          <span className="text-lg font-bold tracking-tight text-green-950 dark:text-white sm:text-xl">Sugamuxi <span className="font-medium text-green-700 dark:text-green-400">Ecoturismo</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="flex items-center gap-2 rounded-full border border-green-800/15 bg-white px-4 py-2 text-sm font-semibold text-green-900 transition hover:border-green-800/40 hover:bg-green-50 dark:border-white/15 dark:bg-slate-900 dark:text-green-300 dark:hover:bg-slate-800">
            <UserRound size={16} /> <span className="hidden sm:inline">Ingresar</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-green-700">Corredor Sugamuxi – Paz de Río</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-green-950 dark:text-white sm:text-5xl lg:text-6xl">Vive el territorio <span className="text-green-700 dark:text-green-400">a tu manera.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">Encuentra experiencias auténticas, conecta con anfitriones locales y descubre la magia de Boyacá.</p>
        </div>

        <div className="relative mt-8 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-green-700" size={21} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué experiencia estás buscando?" className="h-16 w-full rounded-2xl border border-green-900/10 bg-white pl-14 pr-5 text-base text-slate-900 shadow-xl shadow-green-950/5 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-4 focus:ring-green-700/10 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500" aria-label="Buscar experiencias" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-5 sm:px-8 lg:px-10" aria-labelledby="municipios-title">
        <div className="mb-4 flex items-center justify-between"><h2 id="municipios-title" className="text-lg font-bold text-green-950 dark:text-white">Explora por municipio</h2><span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">Elige un destino para comenzar</span></div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {municipalities.map((item) => <button key={item} onClick={() => setMunicipality(item)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${municipality === item ? 'bg-green-800 text-white shadow-md shadow-green-900/15' : 'border border-green-900/10 bg-white text-slate-600 hover:border-green-700 hover:text-green-800 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-green-500 dark:hover:text-green-300'}`}>{item}</button>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-10" aria-labelledby="experiences-title">
        <div className="mb-6 flex items-end justify-between"><div><p className="mb-1 text-sm font-semibold text-green-700 dark:text-green-400">Para ti</p><h2 id="experiences-title" className="text-2xl font-bold text-green-950 dark:text-white sm:text-3xl">Experiencias recomendadas</h2></div><span className="text-sm text-slate-500 dark:text-slate-400">{filteredExperiences.length} experiencias</span></div>
        {filteredExperiences.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{filteredExperiences.map((experience) => <article key={experience.id} className="group overflow-hidden rounded-2xl border border-green-950/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/10 dark:border-white/10 dark:bg-slate-900 dark:hover:shadow-black/30"><Link to={`/experiences/${experience.id}`} className="block"><div className="relative aspect-[4/3] overflow-hidden"><img src={experience.images[0]} alt={experience.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-900 backdrop-blur-sm dark:bg-slate-950/90 dark:text-green-300">{experience.municipality}</span></div><div className="p-5"><div className="mb-2 flex items-center gap-1 text-sm text-slate-800 dark:text-slate-200"><Star size={16} className="fill-amber-400 text-amber-400" /><strong>{experience.rating.toFixed(1)}</strong><span className="text-slate-400">({experience.reviews})</span></div><h3 className="text-lg font-bold text-green-950 dark:text-white">{experience.name}</h3><p className="mt-2 min-h-[3rem] text-sm leading-6 text-slate-500 dark:text-slate-400">{experience.description}</p><div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4 dark:border-white/10"><div><span className="text-xs text-slate-400">Desde</span><p className="font-bold text-green-800 dark:text-green-400">{formatPrice(experience.price)}</p><span className="text-xs text-slate-400">por persona</span></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-800 transition group-hover:bg-green-800 group-hover:text-white dark:bg-green-950 dark:text-green-300" aria-label={`Ver ${experience.name}`}><ArrowRight size={18} /></span></div></div></Link></article>)}</div> : <div className="rounded-2xl border border-dashed border-green-900/20 bg-white p-12 text-center dark:border-white/15 dark:bg-slate-900"><p className="font-semibold text-green-950 dark:text-white">No encontramos experiencias</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Prueba con otro municipio o término de búsqueda.</p></div>}
      </section>
    </main>
  );
}
