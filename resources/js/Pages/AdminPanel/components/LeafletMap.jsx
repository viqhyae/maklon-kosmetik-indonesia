import React from 'react';
import { Map, RefreshCw } from 'lucide-react';

const DEFAULT_CENTER = [-2.5, 118];
const DEFAULT_ZOOM = 5;

const MARKER_STYLES = {
    original: {
        color: '#2563eb',
        label: 'Terverifikasi Asli',
    },
    warning: {
        color: '#f59e0b',
        label: 'Peringatan Keamanan',
    },
    recall: {
        color: '#dc2626',
        label: 'Tag Ditarik (Recall)',
    },
};

const escapeHtml = (value = '') => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const toNumericCoordinate = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

export default function LeafletMap({ locationPoints = [] }) {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const tileLayerRef = React.useRef(null);
    const markerLayerRef = React.useRef(null);
    const hasInitialViewportRef = React.useRef(false);
    const [loaded, setLoaded] = React.useState(false);
    const [mapTheme, setMapTheme] = React.useState('voyager');

    const normalizedPoints = React.useMemo(() => (
        (locationPoints || [])
            .map((point) => {
                const latitude = toNumericCoordinate(point?.latitude);
                const longitude = toNumericCoordinate(point?.longitude);
                if (latitude === null || longitude === null) return null;

                return {
                    city: String(point?.city || '').trim() || 'Lokasi Tidak Diketahui',
                    latitude,
                    longitude,
                    scans: Math.max(0, Number(point?.scans || 0)),
                    originalCount: Math.max(0, Number(point?.originalCount || 0)),
                    suspendedCount: Math.max(0, Number(point?.suspendedCount || 0)),
                    warningCount: Math.max(0, Number(point?.warningCount || 0)),
                    severity: MARKER_STYLES[point?.severity] ? point.severity : 'original',
                };
            })
            .filter(Boolean)
    ), [locationPoints]);

    React.useEffect(() => {
        if (window.L) {
            setLoaded(true);
            return undefined;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);

        return undefined;
    }, []);

    React.useEffect(() => {
        if (!loaded || !mapRef.current || mapInstanceRef.current || !window.L) return undefined;

        const map = window.L.map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: false,
            zoomControl: true,
        });

        tileLayerRef.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap & CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        markerLayerRef.current = window.L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            tileLayerRef.current = null;
            markerLayerRef.current = null;
            hasInitialViewportRef.current = false;
        };
    }, [loaded]);

    React.useEffect(() => {
        if (!tileLayerRef.current) return;

        let newUrl = '';
        switch (mapTheme) {
            case 'positron':
                newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
                break;
            case 'dark':
                newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                break;
            case 'osm':
                newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                break;
            case 'voyager':
            default:
                newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
                break;
        }

        tileLayerRef.current.setUrl(newUrl);
    }, [mapTheme]);

    React.useEffect(() => {
        if (!loaded || !window.L || !mapInstanceRef.current || !markerLayerRef.current) return;

        const map = mapInstanceRef.current;
        const markerLayer = markerLayerRef.current;
        markerLayer.clearLayers();

        if (normalizedPoints.length === 0) {
            if (!hasInitialViewportRef.current) {
                map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
            }
            return;
        }

        const bounds = [];

        normalizedPoints.forEach((point) => {
            const markerStyle = MARKER_STYLES[point.severity] || MARKER_STYLES.original;
            const markerIcon = window.L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
          <div style="position:relative;width:16px;height:16px;display:flex;align-items:center;justify-content:center;">
            <div style="width:14px;height:14px;border-radius:999px;background:${markerStyle.color};border:2.5px solid #ffffff;box-shadow:0 3px 9px rgba(15,23,42,0.35);"></div>
          </div>
        `,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            const tooltipHtml = `
        <div style="font-size:12px;line-height:1.45;min-width:170px;">
          <div style="font-weight:700;color:#0f172a;">${escapeHtml(point.city)}</div>
          <div style="color:#334155;margin-top:2px;">${new Intl.NumberFormat('id-ID').format(point.scans)} aktivitas scan</div>
          <div style="margin-top:4px;color:#475569;">
            <div>Asli: ${new Intl.NumberFormat('id-ID').format(point.originalCount)}</div>
            <div>Peringatan: ${new Intl.NumberFormat('id-ID').format(point.warningCount)}</div>
            <div>Recall: ${new Intl.NumberFormat('id-ID').format(point.suspendedCount)}</div>
          </div>
          <div style="margin-top:4px;font-weight:600;color:${markerStyle.color};">${markerStyle.label}</div>
        </div>
      `;

            const marker = window.L.marker([point.latitude, point.longitude], { icon: markerIcon });
            marker.bindTooltip(tooltipHtml, {
                direction: 'top',
                offset: [0, -10],
                className: 'custom-leaflet-tooltip',
            });
            markerLayer.addLayer(marker);
            bounds.push([point.latitude, point.longitude]);
        });

        if (!hasInitialViewportRef.current) {
            if (bounds.length === 1) {
                map.setView(bounds[0], 10);
            } else {
                map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
            }
            hasInitialViewportRef.current = true;
        }
    }, [loaded, normalizedPoints]);

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
                    <select value={mapTheme} onChange={(event) => setMapTheme(event.target.value)} className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none py-1.5 pl-2 pr-6">
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
