import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

export interface RoutePoint { latitude: number; longitude: number }

function RouteClickCapture({ onAddPoint }: { onAddPoint?: (point: RoutePoint) => void }) {
  useMapEvents({ click: (event) => onAddPoint?.({ latitude: Number(event.latlng.lat.toFixed(6)), longitude: Number(event.latlng.lng.toFixed(6)) }) });
  return null;
}

interface RouteMapProps { points: RoutePoint[]; editable?: boolean; onAddPoint?: (point: RoutePoint) => void; className?: string }

export function RouteMap({ points = [], editable = false, onAddPoint, className = '' }: RouteMapProps) {
  const center: LatLngExpression = points.length ? [points[0].latitude, points[0].longitude] : [5.72, -72.93];
  const line: LatLngExpression[] = points.map((point) => [point.latitude, point.longitude]);
  return <MapContainer center={center} zoom={13} scrollWheelZoom className={`z-0 h-full min-h-[280px] w-full ${className}`}>
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {editable && <RouteClickCapture onAddPoint={onAddPoint} />}
    {line.length > 1 && <Polyline positions={line} pathOptions={{ color: '#166534', weight: 5 }} />}
    {points.map((point, index) => <CircleMarker key={`${point.latitude}-${point.longitude}-${index}`} center={[point.latitude, point.longitude]} radius={index === 0 || index === points.length - 1 ? 8 : 5} pathOptions={{ color: '#14532d', fillColor: index === 0 ? '#f59e0b' : '#22c55e', fillOpacity: 1 }} />)}
  </MapContainer>;
}
