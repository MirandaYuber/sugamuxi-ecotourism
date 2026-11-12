import { useEffect, useState } from 'react';
import { Eraser, Pencil, Plus, Search, Undo2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { operatorApi, type Route, type RouteInput, type RouteStatus } from '@/features/operator/api';
import { RouteMap } from '@/components/RouteMap';
import { AlertMessage } from '@/components/AlertMessage';

const initial: RouteInput = {
  title: '', description: '', municipality: 'Sogamoso', difficulty: 'low', duration_hours: 1, price_cop: 0,
  location_start: { latitude: 5.7, longitude: -72.9 }, route_points: [], images: [], status: 'draft',
};

const labels: Record<string, string> = {
  active: 'Activa', draft: 'Borrador', paused: 'Pausada', low: 'Baja', medium: 'Media', high: 'Alta',
};

const statusStyles: Record<RouteStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  paused: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function OperatorRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [editing, setEditing] = useState<Route | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RouteStatus | 'all'>('all');
  const [notification, setNotification] = useState<{ message: string; variant: 'error' | 'success' } | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<RouteInput>({ defaultValues: initial });
  const routePoints = watch('route_points') ?? [];

  useEffect(() => {
    operatorApi.routes().then(setRoutes).catch((e) => setNotification({ message: e.message, variant: 'error' }));
  }, []);

  const openModal = (route?: Route) => {
    setEditing(route ?? null);
    reset(route ? { ...route, route_points: route.route_points ?? [] } : initial);
    setSelectedImages([]);
    setNotification(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    reset(initial);
    setSelectedImages([]);
  };

  const addRoutePoint = (point: { latitude: number; longitude: number }) => {
    setValue('route_points', [...routePoints, point], { shouldDirty: true });
  };

  const removeLastRoutePoint = () => {
    if (routePoints.length > 0) setValue('route_points', routePoints.slice(0, -1), { shouldDirty: true });
  };

  const clearRoutePoints = () => {
    setValue('route_points', [], { shouldDirty: true });
  };

  const submit = async (data: RouteInput) => {
    try {
      const saved = editing ? await operatorApi.updateRoute(editing.id, data, selectedImages) : await operatorApi.createRoute(data, selectedImages);
      setRoutes((current) => editing ? current.map((route) => route.id === saved.id ? saved : route) : [saved, ...current]);
      setNotification({ message: editing ? 'La ruta se editó exitosamente.' : 'La ruta se creó exitosamente.', variant: 'success' });
      closeModal();
    } catch (e) {
      setNotification({ message: (e as Error).message, variant: 'error' });
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const visibleRoutes = routes.filter((route) => {
    const matchesSearch = `${route.title} ${route.municipality ?? ''}`.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return <section className="mx-auto max-w-6xl">{notification && <AlertMessage message={notification.message} variant={notification.variant} onClose={() => setNotification(null)} />}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm text-green-700 dark:text-green-400">Catálogo de experiencias</p><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Rutas e itinerarios</h2></div>
      <Button type="button" onClick={() => openModal()}><Plus size={17} className="mr-2" /> Nueva ruta</Button>
    </div>
    <div className="relative mb-6 max-w-xl"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o municipio" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500" aria-label="Buscar rutas" /></div>
    <div className="mb-6 flex gap-3 overflow-x-auto pb-2" aria-label="Filtrar rutas por estado">
      {(['all', 'active', 'draft', 'paused'] as const).map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${statusFilter === status ? 'bg-green-800 text-white shadow-md shadow-green-900/15' : 'border border-green-900/10 bg-white text-slate-600 hover:border-green-700 hover:text-green-800 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-green-500 dark:hover:text-green-300'}`}>{status === 'all' ? 'Todas' : labels[status]}</button>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      {visibleRoutes.map((route) => <article key={route.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
        <div className="relative z-0 h-48 isolate"><RouteMap points={route.route_points.length ? route.route_points : [route.location_start]} /></div>
        <div className="relative z-10 bg-white p-6 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="min-w-0"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[route.status]}`}>{labels[route.status]}</span><h3 className="mt-2 line-clamp-1 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white" title={route.title}>{route.title}</h3></div>
            <button type="button" onClick={() => openModal(route)} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2" aria-label={`Editar ${route.title}`}><Pencil size={16} /> Editar ruta</button>
          </div>
          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm dark:border-white/10 sm:grid-cols-4"><div><span className="block text-xs uppercase tracking-wide text-slate-400">Municipio</span><strong className="mt-1 block text-base text-slate-800 dark:text-slate-200">{route.municipality ?? 'Sin definir'}</strong></div><div><span className="block text-xs uppercase tracking-wide text-slate-400">Dificultad</span><strong className="mt-1 block text-base text-slate-800 dark:text-slate-200">{labels[route.difficulty]}</strong></div><div><span className="block text-xs uppercase tracking-wide text-slate-400">Duración</span><strong className="mt-1 block text-base text-slate-800 dark:text-slate-200">{route.duration_hours} horas</strong></div><div><span className="block text-xs uppercase tracking-wide text-slate-400">Precio</span><strong className="mt-1 block text-base text-green-800 dark:text-green-300">${route.price_cop.toLocaleString('es-CO')}</strong></div></div>
        </div>
      </article>)}
    </div>
    {visibleRoutes.length === 0 && <div className="rounded-xl border border-dashed bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-white">{routes.length === 0 ? 'Aún no tienes rutas' : 'No encontramos rutas'}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{routes.length === 0 ? 'Crea tu primera experiencia para publicarla en el catálogo.' : 'Prueba con otro nombre, municipio o estado.'}</p></div>}

    {isModalOpen && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="route-modal-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-sm text-green-700 dark:text-green-400">{editing ? 'Actualizar experiencia' : 'Nueva experiencia'}</p><h3 id="route-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">{editing ? 'Editar ruta' : 'Crear ruta'}</h3></div><button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Cerrar modal"><X size={20} /></button></div>
        <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium md:col-span-2">Nombre de la ruta<Input {...register('title')} className="mt-1" required /></label>
          <label className="text-sm font-medium md:col-span-2">Descripción<textarea {...register('description')} className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950 dark:text-white" required /></label>
          <label className="text-sm font-medium">Municipio<select {...register('municipality')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950 dark:text-white"><option>Sogamoso</option><option>Corrales</option><option>Tasco</option><option>Paz de Río</option></select></label>
          <label className="text-sm font-medium">Dificultad<select {...register('difficulty')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950 dark:text-white"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label>
          <label className="text-sm font-medium">Estado<select {...register('status')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950 dark:text-white"><option value="draft">Borrador</option><option value="active">Activa</option><option value="paused">Pausada</option></select></label>
          <label className="text-sm font-medium">Duración (horas)<Input type="number" min="1" step="0.5" {...register('duration_hours', { valueAsNumber: true })} className="mt-1" required /></label>
           <label className="text-sm font-medium">Precio por persona (COP)<Input type="number" min="0" {...register('price_cop', { valueAsNumber: true })} className="mt-1" required /></label>
           <label className="text-sm font-medium md:col-span-2">Imágenes de la experiencia<Input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setSelectedImages(Array.from(event.target.files ?? []))} className="mt-1 block w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950 dark:text-white" /><span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">Puedes seleccionar varias imágenes de hasta 5 MB cada una.{editing?.images.length ? ` La ruta ya tiene ${editing.images.length} imagen(es); las nuevas reemplazarán las actuales.` : ''}</span></label>
          <div className="md:col-span-2"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">Puntos de la ruta</p><div className="flex gap-2"><button type="button" onClick={removeLastRoutePoint} disabled={routePoints.length === 0} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-slate-200 dark:hover:bg-slate-800"><Undo2 size={14} /> Eliminar último</button><button type="button" onClick={clearRoutePoints} disabled={routePoints.length === 0} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"><Eraser size={14} /> Limpiar todos</button></div></div><div className="h-64 overflow-hidden rounded-lg border dark:border-white/10"><RouteMap points={routePoints.length ? routePoints : [initial.location_start]} editable onAddPoint={addRoutePoint} /></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Haz clic en el mapa para agregar puntos al recorrido ({routePoints.length} registrados).</p></div>
          <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear ruta'}</Button></div>
        </form>
      </section>
    </div>}
  </section>;
}
