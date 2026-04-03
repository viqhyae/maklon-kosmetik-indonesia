import React from 'react';
import { Map, RefreshCw } from 'lucide-react';

export default function LeafletMap() {
    const mapRef = React.useRef(null);
    const tileLayerRef = React.useRef(null);
    const [loaded, setLoaded] = React.useState(false);
    const [mapTheme, setMapTheme] = React.useState('voyager');

    React.useEffect(() => {
        if (window.L) {
            setLoaded(true);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);
    }, []);

    React.useEffect(() => {
        if (!loaded || !mapRef.current) return;

        const map = window.L.map(mapRef.current, {
            center: [-2.5, 118],
            zoom: 5,
            scrollWheelZoom: false,
            zoomControl: true
        });

        tileLayerRef.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap & CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        const locationData = [
            { city: "Medan", coords: [3.5952, 98.6722], scans: 45, bg: "bg-blue-600" },
            { city: "Pekanbaru", coords: [0.5071, 101.4478], scans: 22, bg: "bg-red-600" },
            { city: "Palembang", coords: [-2.9909, 104.7566], scans: 38, bg: "bg-green-600" },
            { city: "Jakarta", coords: [-6.2088, 106.8456], scans: 120, bg: "bg-red-600", active: true },
            { city: "Semarang", coords: [-6.9667, 110.4167], scans: 56, bg: "bg-green-600" },
            { city: "Surabaya", coords: [-7.2504, 112.7688], scans: 85, bg: "bg-blue-600" },
            { city: "Denpasar", coords: [-8.6500, 115.2167], scans: 62, bg: "bg-blue-600" },
            { city: "Pontianak", coords: [-0.0227, 109.3333], scans: 30, bg: "bg-red-600" },
            { city: "Balikpapan", coords: [-1.2379, 116.8529], scans: 34, bg: "bg-green-600" },
            { city: "Makassar", coords: [-5.1476, 119.4327], scans: 55, bg: "bg-blue-600", active: true },
            { city: "Manado", coords: [1.4931, 124.8413], scans: 25, bg: "bg-blue-600" },
            { city: "Ambon", coords: [-3.6954, 128.1814], scans: 18, bg: "bg-red-600" },
            { city: "Jayapura", coords: [-2.5337, 140.7186], scans: 12, bg: "bg-green-600" },
        ];

        locationData.forEach((loc) => {
            const customIcon = window.L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
           <div class="relative w-4 h-4 flex items-center justify-center">
             ${loc.active ? `<span class="absolute inset-0 ${loc.bg} rounded-full animate-ping opacity-50 w-full h-full scale-150"></span>` : ''}
             <div class="w-4 h-4 ${loc.bg} rounded-full border-[2.5px] border-white shadow-md relative z-10"></div>
           </div>
         `,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = window.L.marker(loc.coords, { icon: customIcon }).addTo(map);

            marker.bindTooltip(
                `<div class="font-sans text-xs">
            <span class="font-bold text-slate-800">${loc.city}</span><br/>
            <span class="text-slate-500">${loc.scans} Scans</span>
          </div>`,
                { direction: 'top', offset: [0, -10], className: 'custom-leaflet-tooltip' }
            );
        });

        return () => { map.remove(); };
    }, [loaded]);

    React.useEffect(() => {
        if (tileLayerRef.current) {
            let newUrl = '';
            switch (mapTheme) {
                case 'positron': newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; break;
                case 'dark': newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; break;
                case 'osm': newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; break;
                case 'voyager':
                default: newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; break;
            }
            tileLayerRef.current.setUrl(newUrl);
        }
    }, [mapTheme]);

    return (
        <div className="w-full h-full relative z-0">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
                    <RefreshCw className="animate-spin mr-2" size={16} /> Memuat Peta Interaktif...
                </div>
            )}
            {loaded && (
                <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-1 flex items-center hover:bg-white transition-colors">
                    <Map size={14} className="text-[#C1986E] ml-2" />
                    <select value={mapTheme} onChange={(e) => setMapTheme(e.target.value)} className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none py-1.5 pl-2 pr-6">
                        <option value="voyager">Laut Biru Cerah (Voyager)</option>
                        <option value="osm">Laut Biru Klasik (OSM)</option>
                        <option value="positron">Laut Abu-abu (Positron)</option>
                        <option value="dark">Laut Hitam (Mode Gelap)</option>
                    </select>
                </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
        </div>
    );
}
