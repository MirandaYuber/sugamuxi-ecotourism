import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, CheckCircle2, X } from 'lucide-react';
import { AlertMessage } from '@/components/AlertMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { visitorApi } from './api';
import { VisitorBookingsModal } from './VisitorBookingsModal';
import type { Experience } from '@/data/experiences';

const schema = z.object({
  visitor_name: z.string().min(3, 'Ingresa tu nombre completo'),
  visitor_email: z.string().email('Ingresa un correo válido'),
  visitor_phone: z.string().regex(/^[+\d\s()-]{7,20}$/, 'Ingresa un teléfono válido'),
  booking_date: z.string().min(1, 'Selecciona una fecha'),
  preferred_time: z.string().min(1, 'Selecciona un horario'),
  num_people: z.coerce.number().min(1, 'Mínimo una persona').max(20, 'Máximo 20 personas'),
  visitor_message: z.string().max(500, 'Máximo 500 caracteres').optional(),
  special_requirements: z.string().max(500, 'Máximo 500 caracteres').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Debes autorizar el contacto del guía' }) }),
});

type Form = z.infer<typeof schema>;

export function ReservationModal({ experience, onClose }: { experience: Experience; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { num_people: 1 } });
  const minimumDate = new Date().toISOString().split('T')[0];

  const submit = async (data: Form) => {
    setSubmitError('');
    try {
      await visitorApi.create({ experience_id: experience.id, booking_date: data.booking_date, preferred_time: data.preferred_time, num_people: data.num_people, visitor_name: data.visitor_name, visitor_email: data.visitor_email, visitor_phone: data.visitor_phone, visitor_message: data.visitor_message, special_requirements: data.special_requirements });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No fue posible enviar la solicitud.');
    }
  };

  return <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="reservation-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-green-700 dark:text-green-400">Solicitar disponibilidad</p><h2 id="reservation-title" className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{experience.name}</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Cerrar formulario"><X size={20} /></button></div>{submitted ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto text-green-600" size={52} /><h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Solicitud enviada</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">El guía revisará tu solicitud y podrá contactarte al teléfono registrado.</p><div className="mt-6 flex justify-center gap-3"><Button type="button" variant="outline" onClick={onClose}>Cerrar</Button><Button type="button" onClick={() => setShowBookings(true)}>Ver mis solicitudes</Button></div></div> : <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4 sm:grid-cols-2">{submitError && <div className="sm:col-span-2"><AlertMessage message={submitError} /></div>}<label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nombre completo<Input {...register('visitor_name')} className="mt-1" />{errors.visitor_name && <small className="text-red-600 dark:text-red-400">{errors.visitor_name.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Correo electrónico<Input type="email" {...register('visitor_email')} className="mt-1" />{errors.visitor_email && <small className="text-red-600 dark:text-red-400">{errors.visitor_email.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Teléfono de contacto<Input type="tel" placeholder="300 000 0000" {...register('visitor_phone')} className="mt-1" />{errors.visitor_phone && <small className="text-red-600 dark:text-red-400">{errors.visitor_phone.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Número de personas<Input type="number" min="1" max="20" {...register('num_people')} className="mt-1" />{errors.num_people && <small className="text-red-600 dark:text-red-400">{errors.num_people.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200"><span className="flex items-center gap-2"><CalendarDays size={15} /> Fecha preferida</span><Input type="date" min={minimumDate} {...register('booking_date')} className="mt-1" />{errors.booking_date && <small className="text-red-600 dark:text-red-400">{errors.booking_date.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Horario preferido<select {...register('preferred_time')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-950 dark:text-white"><option value="">Selecciona un horario</option><option>7:00 a. m.</option><option>8:00 a. m.</option><option>9:00 a. m.</option><option>10:00 a. m.</option></select>{errors.preferred_time && <small className="text-red-600 dark:text-red-400">{errors.preferred_time.message}</small>}</label><label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">Mensaje para el guía<textarea {...register('visitor_message')} placeholder="Cuéntale al guía qué esperas de la experiencia..." className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">Necesidades especiales<textarea {...register('special_requirements')} placeholder="Alergias, movilidad, alimentación u otra información importante..." className="mt-1 min-h-20 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" /></label><label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 sm:col-span-2"><input type="checkbox" {...register('consent')} className="mt-1 h-4 w-4 accent-green-700" /><span>Acepto que el guía use mi teléfono y correo para responder esta solicitud y resolver dudas sobre la experiencia.</span></label>{errors.consent && <small className="text-red-600 dark:text-red-400 sm:col-span-2">{errors.consent.message}</small>}<div className="flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar solicitud'}</Button></div></form>}{showBookings && <VisitorBookingsModal onClose={() => setShowBookings(false)} />}</section></div>;
}
