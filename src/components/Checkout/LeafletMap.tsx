"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon references image files by a relative path
// that Webpack doesn't resolve — pointing it at the CDN copies (same files
// Leaflet ships) sidesteps the classic "broken marker" issue without needing
// to bundle static assets or touch next.config.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GAZA_CENTER: [number, number] = [31.5, 34.47];

interface LeafletMapProps {
  initialPosition?: { lat: number; lng: number };
  onChange: (position: { lat: number; lng: number }) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Recenters the map imperatively once a position is set after the initial
 *  render (e.g. once geolocation resolves) — `MapContainer`'s `center` prop
 *  only applies on mount, so later updates need `map.setView` directly. */
function Recenter({ position, zoom }: { position: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
}

export default function LeafletMap({ initialPosition, onChange }: LeafletMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : null,
  );

  // No saved position yet — default the view (and the pin) to the user's
  // current GPS location instead of the fixed Gaza-center fallback.
  useEffect(() => {
    if (initialPosition || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(next);
        onChange({ lat: next[0], lng: next[1] });
      },
      () => {
        /* Permission denied or unavailable — falls back to the static
           Gaza-center view below; the user can still tap/drag to pick. */
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange({ lat, lng });
  }

  const view = position ?? GAZA_CENTER;

  return (
    <MapContainer
      center={view}
      zoom={position ? 15 : 12}
      className="w-full h-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat, lng } = marker.getLatLng();
              handlePick(lat, lng);
            },
          }}
        />
      )}
      <Recenter position={view} zoom={position ? 15 : 12} />
      <ClickHandler onPick={handlePick} />
    </MapContainer>
  );
}
