'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PresensiMapProps {
  kantorLat: number;
  kantorLng: number;
  radius: number;
  onLocationValid: (isValid: boolean, lat: number, lng: number) => void;
}

export default function PresensiMap({ kantorLat, kantorLng, radius, onLocationValid }: PresensiMapProps) {
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Browser Anda tidak mendukung GPS / Geolocation.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });

        // Calculate distance in meters using Haversine formula
        const R = 6371e3; // metres
        const lat1 = kantorLat * Math.PI/180;
        const lat2 = latitude * Math.PI/180;
        const deltaLat = (latitude-kantorLat) * Math.PI/180;
        const deltaLng = (longitude-kantorLng) * Math.PI/180;

        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // in metres

        setDistance(Math.round(d));
        if (d <= radius) {
          onLocationValid(true, latitude, longitude);
        } else {
          onLocationValid(false, latitude, longitude);
        }
      },
      (err) => {
        setErrorMsg('Gagal mendapatkan lokasi. Pastikan izin GPS diberikan.');
        onLocationValid(false, 0, 0);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [kantorLat, kantorLng, radius, onLocationValid]);

  if (errorMsg) {
    return (
      <div className="w-full h-64 bg-red-50 flex items-center justify-center rounded-2xl border-2 border-red-200 p-6 text-center text-red-600">
        <div>
          <MapPin className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!userLoc) {
    return (
      <div className="w-full h-64 bg-slate-100 animate-pulse flex items-center justify-center rounded-2xl">
        <span className="text-slate-400 font-medium">Mencari lokasi GPS Anda...</span>
      </div>
    );
  }

  const isInside = distance !== null && distance <= radius;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-64 rounded-2xl overflow-hidden border-4 border-white shadow-lg relative z-0">
        <MapContainer 
          center={[kantorLat, kantorLng]} 
          zoom={16} 
          scrollWheelZoom={false} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[kantorLat, kantorLng]}>
            <Popup>Pusat Kantor</Popup>
          </Marker>
          <Circle 
            center={[kantorLat, kantorLng]} 
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
            radius={radius} 
          />
          <Circle 
            center={[userLoc.lat, userLoc.lng]} 
            pathOptions={{ 
              color: isInside ? 'green' : 'red', 
              fillColor: isInside ? 'green' : 'red', 
              fillOpacity: 0.4 
            }} 
            radius={15} 
          >
            <Popup>Lokasi Anda ({distance}m)</Popup>
          </Circle>
        </MapContainer>
      </div>

      {distance !== null && (
        <div className={`text-center text-sm font-medium p-2 rounded-lg ${isInside ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          Jarak Anda dari kantor: {distance} meter
          {!isInside && ` (Maksimal ${radius} meter)`}
        </div>
      )}
    </div>
  );
}
