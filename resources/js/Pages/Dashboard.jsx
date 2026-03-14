import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Building2,
    Package,
    Tag,
    ScanLine,
    Users,
    Settings,
    Plus,
    Search,
    Menu,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    Database,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Image as ImageIcon,
    FileText,
    Layers,
    FlaskConical,
    Edit,
    X,
    ListTree,
    UploadCloud,
    QrCode,
    Printer,
    RefreshCw,
    FileArchive,
    Download,
    Calendar,
    Hash,
    ShieldCheck,
    Lock,
    Filter,
    ArrowRight,
    MoreHorizontal,
    Info,
    Map,
    MapPin,
    Activity,
    TrendingUp,
    Clock,
    Key,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    LogOut,
    ArrowLeft,
    Droplets,
    Sparkles
} from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { createPortal } from 'react-dom';
// Import QRCode untuk generate QR berbasis Vektor (SVG)
import { QRCodeSVG } from 'qrcode.react';

// --- DATA INITIAL KATEGORI (Default) ---
const INITIAL_CATEGORY_DATA = [
    {
        id: 1,
        name: "Perawatan & Kecantikan",
        subCategories: [
            {
                id: 11,
                name: "Parfum & Wewangian",
                subSubCategories: [
                    { id: 111, name: "Eau De Parfum (EDP)" },
                    { id: 112, name: "Eau De Toilette (EDT)" },
                    { id: 113, name: "Body Mist / Cologne" },
                    { id: 114, name: "Extrait De Parfum" }
                ]
            },
            {
                id: 12,
                name: "Perawatan Wajah",
                subSubCategories: [
                    { id: 121, name: "Pembersih Wajah" },
                    { id: 122, name: "Toner" },
                    { id: 123, name: "Pelembab Wajah" },
                    { id: 124, name: "Minyak Wajah" },
                    { id: 125, name: "Facial Mist" },
                    { id: 126, name: "Serum & Essence Wajah" },
                    { id: 127, name: "Scrub & Peel Wajah" },
                    { id: 128, name: "Masker Wajah" },
                    { id: 129, name: "Treatment Mata" },
                    { id: 130, name: "Treatment Bibir" }
                ]
            },
            {
                id: 13,
                name: "Perawatan Tubuh",
                subSubCategories: [
                    { id: 131, name: "Sabun Mandi" },
                    { id: 132, name: "Scrub & Peel Tubuh" },
                    { id: 133, name: "Masker Tubuh" },
                    { id: 134, name: "Minyak Tubuh" },
                    { id: 135, name: "Body Cream, Lotion & Butter" },
                    { id: 136, name: "Deodoran" }
                ]
            }
        ]
    }
];

// --- BLUEPRINT / SKEMA FORM DINAMIS ---
const PRODUCT_SPEC_SCHEMA = {
    11: { // Sub-Kategori: Parfum & Wewangian
        title: "Spesifikasi Wewangian",
        icon: Droplets,
        theme: { bg: "bg-purple-50/50 border-purple-100", title: "text-purple-800 border-purple-100", label: "text-purple-700", input: "border-purple-200 focus:ring-purple-500/50" },
        fields: [
            { name: "topNotes", label: "Top Notes (Aroma Awal)", type: "text", placeholder: "Contoh: Bergamot, Mandarin", colSpan: 1 },
            { name: "baseNotes", label: "Base Notes (Aroma Akhir)", type: "text", placeholder: "Contoh: Vanilla, Musk, Cedarwood", colSpan: 1 },
            { name: "longevity", label: "Klaim Ketahanan Aroma", type: "select", options: ["4 - 6 Jam", "6 - 8 Jam", "Hingga 12 Jam", "Lebih dari 12 Jam"], colSpan: 2 }
        ]
    },
    12: { // Sub-Kategori: Perawatan Wajah
        title: "Spesifikasi Perawatan Wajah",
        icon: FlaskConical,
        theme: { bg: "bg-blue-50/50 border-blue-100", title: "text-blue-800 border-blue-100", label: "text-blue-700", input: "border-blue-200 focus:ring-blue-500/50" },
        fields: [
            { name: "bpom", label: "Nomor BPOM", type: "text", placeholder: "NA182XXXXXXX", colSpan: 1 },
            { name: "skinType", label: "Direkomendasikan Untuk", type: "select", options: ["Semua Tipe Kulit", "Berminyak & Berjerawat", "Kering & Sensitif", "Kombinasi"], colSpan: 1 },
            { name: "ingredients", label: "Bahan Aktif Utama (Key Ingredients)", type: "text", placeholder: "Contoh: Niacinamide 5%, Salicylic Acid", colSpan: 2 }
        ]
    },
    13: { // Sub-Kategori: Perawatan Tubuh
        title: "Spesifikasi Perawatan Tubuh",
        icon: Sparkles,
        theme: { bg: "bg-emerald-50/50 border-emerald-100", title: "text-emerald-800 border-emerald-100", label: "text-emerald-700", input: "border-emerald-200 focus:ring-emerald-500/50" },
        fields: [
            { name: "bpom", label: "Nomor BPOM", type: "text", placeholder: "NA182XXXXXXX", colSpan: 1 },
            { name: "skinType", label: "Tipe Kulit", type: "select", options: ["Semua Tipe Kulit", "Kulit Kering", "Kulit Sensitif", "Aman untuk Eksim"], colSpan: 1 },
            { name: "ingredients", label: "Bahan Aktif Utama", type: "text", placeholder: "Contoh: Shea Butter, Ceramide, Vitamin E", colSpan: 1 },
            { name: "fragrance", label: "Aroma Tambahan", type: "text", placeholder: "Contoh: Vanilla, Floral, Non-Perfumed", colSpan: 1 }
        ]
    }
};

// Komponen Card Sederhana untuk Dashboard
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

// Komponen Reusable untuk Alert Halaman
const PageAlert = ({ text }) => (
    <div className="flex gap-3 text-sm text-blue-700 bg-blue-50/80 p-4 rounded-xl border border-blue-200/60 items-start mb-2 shadow-sm">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p>{text}</p>
    </div>
);

// Komponen Reusable untuk Toggle Switch (Seragam)
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.preventDefault(); if (!disabled && onChange) onChange(); }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:ring-offset-2 mx-1 ${checked ? 'bg-[#C1986E]' : 'bg-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

// Komponen Reusable untuk Tooltip Custom
const Tooltip = ({ children, text, position = 'top', wrapperClass = "inline-flex items-center justify-center", style }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: -9999, left: -9999 });
    const [actualPos, setActualPos] = React.useState(position);
    const [arrowStyles, setArrowStyles] = React.useState({});

    const wrapperRef = React.useRef(null);
    const tooltipRef = React.useRef(null);

    React.useLayoutEffect(() => {
        if (isVisible && wrapperRef.current && tooltipRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top, left;
            let calcPos = position;

            const spaceTop = rect.top;
            const spaceBottom = window.innerHeight - rect.bottom;
            const spaceLeft = rect.left;
            const spaceRight = window.innerWidth - rect.right;

            if (position === 'top' && spaceTop < tooltipRect.height + 15 && spaceBottom > tooltipRect.height + 15) calcPos = 'bottom';
            if (position === 'bottom' && spaceBottom < tooltipRect.height + 15 && spaceTop > tooltipRect.height + 15) calcPos = 'top';
            if (position === 'left' && spaceLeft < tooltipRect.width + 15 && spaceRight > tooltipRect.width + 15) calcPos = 'right';
            if (position === 'right' && spaceRight < tooltipRect.width + 15 && spaceLeft > tooltipRect.width + 15) calcPos = 'left';

            setActualPos(calcPos);

            const GAP = 8;

            switch (calcPos) {
                case 'top':
                    top = rect.top - tooltipRect.height - GAP;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'bottom':
                    top = rect.bottom + GAP;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.left - tooltipRect.width - GAP;
                    break;
                case 'right':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.right + GAP;
                    break;
            }

            if (calcPos === 'top' || calcPos === 'bottom') {
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
                let arrowLeft = rect.left + (rect.width / 2) - left;
                arrowLeft = Math.max(10, Math.min(tooltipRect.width - 10, arrowLeft));
                setArrowStyles({ left: `${arrowLeft}px`, transform: 'translateX(-50%)' });
            } else {
                if (top < 10) top = 10;
                if (top + tooltipRect.height > window.innerHeight - 10) top = window.innerHeight - tooltipRect.height - 10;
                let arrowTop = rect.top + (rect.height / 2) - top;
                arrowTop = Math.max(10, Math.min(tooltipRect.height - 10, arrowTop));
                setArrowStyles({ top: `${arrowTop}px`, transform: 'translateY(-50%)' });
            }

            setCoords({ top, left });
        }
    }, [isVisible, position, text]);

    return (
        <div
            ref={wrapperRef}
            className={`relative group ${wrapperClass}`}
            style={style}
            onMouseEnter={() => text && setIsVisible(true)}
            onMouseLeave={() => {
                setIsVisible(false);
                setCoords({ top: -9999, left: -9999 });
            }}
        >
            {children}
            {isVisible && text && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed whitespace-nowrap bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded z-[99999] shadow-xl pointer-events-none transition-opacity duration-200 animate-in fade-in zoom-in-95"
                    style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
                >
                    {text}
                    <div
                        className={`absolute w-0 h-0 ${actualPos === 'top' ? 'top-full border-t-slate-800 border-x-transparent border-b-transparent border-[5px]' :
                            actualPos === 'bottom' ? 'bottom-full border-b-slate-800 border-x-transparent border-t-transparent border-[5px]' :
                                actualPos === 'left' ? 'left-full border-l-slate-800 border-y-transparent border-r-transparent border-[5px]' :
                                    'right-full border-r-slate-800 border-y-transparent border-l-transparent border-[5px]'
                            }`}
                        style={arrowStyles}
                    ></div>
                </div>,
                document.body
            )}
        </div>
    );
};

// Komponen Leaflet Map Kustom
const LeafletMap = () => {
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

        locationData.forEach(loc => {
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
};

export default function Dashboard({ databaseBrands, databaseCategories }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    // --- STATE ALERT & MODAL KONFIRMASI (GLOBAL) ---
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
    const [confirmObj, setConfirmObj] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const showToast = (message, type = 'success') => {
        setToast({ isOpen: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 3000);
    };

    // --- STATE MODAL UTAMA ---
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);
    const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);

    // --- STATE MODAL PICKER KATEGORI (BARU) ---
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [catSearchKeyword, setCatSearchKeyword] = useState('');
    const [tempCategory, setTempCategory] = useState({ l1: '', l2: '', l3: '' });
    const [activeFormSection, setActiveFormSection] = useState('info'); // Untuk active state sticky menu

    // --- STATE PENCARIAN & SORTING ---
    const [globalSearch, setGlobalSearch] = useState('');
    const [brandSort, setBrandSort] = useState({ key: 'id', direction: 'desc' });
    const [productSort, setProductSort] = useState({ key: 'id', direction: 'desc' });
    const [userSort, setUserSort] = useState({ key: 'id', direction: 'desc' });
    const [batchSort, setBatchSort] = useState({ key: 'id', direction: 'desc' });
    const [scanSort, setScanSort] = useState({ key: 'time', direction: 'asc' });

    // Helper untuk icon sorting di table header
    const SortIcon = ({ columnKey, sortConfig }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[#C1986E]" /> : <ArrowDown size={14} className="text-[#C1986E]" />;
    };

    // Helper handler untuk klik header tabel
    const handleSortChange = (key, sortConfig, setSortConfig) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleLogout = () => {
        setConfirmObj({
            isOpen: true,
            title: "Keluar Sistem?",
            message: "Sesi Anda akan diakhiri dan harus login kembali untuk mengakses halaman ini. Lanjutkan?",
            onConfirm: () => {
                router.post('/logout', {}, {
                    onError: () => {
                        showToast("Gagal logout. Silakan coba lagi.", "error");
                    }
                });
            }
        });
    };

    // --- HELPER UNTUK JUDUL HALAMAN (HEADER) ---
    const getPageTitle = (tab) => {
        switch (tab) {
            case 'dashboard': return 'Dashboard';
            case 'scan_history': return 'Aktivitas Scan';
            case 'brand': return 'Brand';
            case 'categories': return 'Kategori Produk';
            case 'product': return 'SKU Produk';
            case 'product_form': return editingProductId ? 'Edit SKU Produk' : 'Tambah SKU Baru';
            case 'tags': return 'Generate Tag/QR';
            case 'users': return 'Users & Roles';
            case 'settings': return 'Pengaturan';
            default: return 'Dashboard';
        }
    };

    // --- STATE DATA ---
    const [systemUsers, setSystemUsers] = useState([
        { id: 1, name: "Admin Utama", email: "admin@mki.co.id", role: "Super Admin", status: "Aktif" },
        { id: 2, name: "Bapak Owner", email: "owner@mki.co.id", role: "Brand Owner", status: "Aktif" },
        { id: 3, name: "Ibu Clara", email: "clara@glowco.id", role: "Brand Owner", status: "Aktif" },
        { id: 4, name: "Bapak Andi", email: "andi@mensgroom.id", role: "Brand Owner", status: "Aktif" }
    ]);

    const normalizeBrandStatus = (status) => (
        status === 1 || status === '1' || status === true || status === 'Aktif' ? 1 : 0
    );
    const getBrandStatusLabel = (status) => normalizeBrandStatus(status) === 1 ? 'Aktif' : 'Non-aktif';
    const isBrandActive = (status) => normalizeBrandStatus(status) === 1;
    const createEmptyBrandInput = () => ({ name: '', description: '', owner_name: '', status: 1 });
    const getFirstErrorMessage = (errors, fallbackMessage) => {
        const firstError = Object.values(errors || {})[0];
        if (Array.isArray(firstError)) return firstError[0] || fallbackMessage;
        return firstError || fallbackMessage;
    };
    const normalizeBrandRecord = (brand) => ({
        ...brand,
        owner_name: brand.owner_name || '',
        description: brand.description || '',
        status: normalizeBrandStatus(brand.status),
        brand_code: brand.brand_code || brand.code || `ID-${brand.id}`,
    });

    const [brands, setBrands] = useState((databaseBrands || []).map(normalizeBrandRecord));
    useEffect(() => {
        setBrands((databaseBrands || []).map(normalizeBrandRecord));
    }, [databaseBrands]);

    const [categories, setCategories] = useState(
        Array.isArray(databaseCategories) ? databaseCategories : INITIAL_CATEGORY_DATA
    );
    useEffect(() => {
        setCategories(Array.isArray(databaseCategories) ? databaseCategories : INITIAL_CATEGORY_DATA);
    }, [databaseCategories]);

    const [products, setProducts] = useState([
        {
            id: 101, name: "Luxury Rose EDP 30ml", brandId: 3, brandName: "Luxe Scents",
            description: "Parfum wangi mawar mewah dengan botol kaca. Mengandung ekstrak mawar asli dengan ketahanan hingga 12 jam. Cocok untuk acara formal maupun daily use.",
            categoryPath: "Perawatan & Kecantikan > Parfum & Wewangian > Eau De Parfum (EDP)",
            catL1: 1, catL2: 11, catL3: 111,
            skuCode: "LS-EDP-ROS-30",
            dynamicFields: { topNotes: "Bergamot, Mandarin", baseNotes: "Vanilla, Musk, Cedarwood", longevity: "Hingga 12 Jam" }
        },
        {
            id: 102, name: "Acne Fighter Night Cream", brandId: 2, brandName: "DermaBeauty",
            description: "Krim malam untuk kulit berjerawat. Membantu meredakan kemerahan dan mengempeskan jerawat meradang dalam waktu singkat.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Pelembab Wajah",
            catL1: 1, catL2: 12, catL3: 123,
            skuCode: "DB-NC-ACN-15",
            dynamicFields: { bpom: "NA1821010001", skinType: "Berminyak & Berjerawat", ingredients: "Niacinamide 5%, Salicylic Acid, Tea Tree Extract" }
        },
        {
            id: 103, name: "Gentle Facial Wash 100ml", brandId: 1, brandName: "Glow & Co",
            description: "Pembersih wajah lembut tanpa busa untuk kulit sensitif.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Pembersih Wajah",
            catL1: 1, catL2: 12, catL3: 121,
            skuCode: "GC-FW-GNT-100",
            dynamicFields: { bpom: "NA1821010002", skinType: "Kering & Sensitif", ingredients: "Aloe Vera, Chamomile Extract" }
        },
        {
            id: 104, name: "Hydrating Toner Mist", brandId: 1, brandName: "Glow & Co",
            description: "Toner spray penyegar wajah dengan aloe vera.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Wajah > Facial Mist",
            catL1: 1, catL2: 12, catL3: 125,
            skuCode: "GC-TM-HYD-60",
            dynamicFields: { bpom: "NA1821010003", skinType: "Semua Tipe Kulit", ingredients: "Hyaluronic Acid, Rose Water" }
        },
        {
            id: 105, name: "Coffee Body Scrub", brandId: 5, brandName: "PureNaturals",
            description: "Scrub mandi eksfoliasi aroma kopi.",
            categoryPath: "Perawatan & Kecantikan > Perawatan Tubuh > Scrub & Peel Tubuh",
            catL1: 1, catL2: 13, catL3: 132,
            skuCode: "PN-BS-COF-250",
            dynamicFields: {}
        },
        {
            id: 106, name: "Hair & Body Perfume Sport", brandId: 6, brandName: "Men's Groom",
            description: "Parfum rambut dan badan untuk pria aktif.",

            categoryPath: "Perawatan & Kecantikan > Parfum & Wewangian > Body Mist / Cologne",
            catL1: 1, catL2: 11, catL3: 113,
            skuCode: "MG-BM-SPT-100",
            dynamicFields: { topNotes: "Citrus, Mint", baseNotes: "Sandalwood, Amber", longevity: "6 - 8 Jam" }
        }
    ]);

    const [tags, setTags] = useState([
        // Batch Aktif - Luxury Rose EDP (101)
        { code: "MKI-101-ABCD1234", productId: 101, id: 1682000000001, productName: "Luxury Rose EDP 30ml", status: "Aktif", batchId: "BATCH-820001", pin: "123456", ecc: "M" },
        { code: "MKI-101-EFGH5678", productId: 101, id: 1682000000002, productName: "Luxury Rose EDP 30ml", status: "Aktif", batchId: "BATCH-820001", pin: "654321", ecc: "M" },
        { code: "MKI-101-WXYZ9012", productId: 101, id: 1682000000003, productName: "Luxury Rose EDP 30ml", status: "Sudah Scan", batchId: "BATCH-820001", pin: "112233", ecc: "M" },

        // Batch Aktif - Acne Fighter Night Cream (102)
        { code: "MKI-102-IJKL9012", productId: 102, id: 1682100000001, productName: "Acne Fighter Night Cream", status: "Aktif", batchId: "BATCH-821001", pin: null, ecc: "L" },
        { code: "MKI-102-MNOP3456", productId: 102, id: 1682100000002, productName: "Acne Fighter Night Cream", status: "Aktif", batchId: "BATCH-821001", pin: null, ecc: "L" },
        { code: "MKI-102-QRST7890", productId: 102, id: 1682100000003, productName: "Acne Fighter Night Cream", status: "Invalid", batchId: "BATCH-821001", pin: null, ecc: "L" },

        // Batch Suspended - Gentle Facial Wash (103)
        { code: "MKI-103-SUSP0001", productId: 103, id: 1682200000001, productName: "Gentle Facial Wash 100ml", status: "Suspended", batchId: "BATCH-822002", pin: "998877", ecc: "H" },
        { code: "MKI-103-SUSP0002", productId: 103, id: 1682200000002, productName: "Gentle Facial Wash 100ml", status: "Suspended", batchId: "BATCH-822002", pin: "778899", ecc: "H" },

        // Batch Aktif - Coffee Body Scrub (105)
        { code: "MKI-105-SCRB0001", productId: 105, id: 1682300000001, productName: "Coffee Body Scrub", status: "Aktif", batchId: "BATCH-823003", pin: null, ecc: "M" },
        { code: "MKI-105-SCRB0002", productId: 105, id: 1682300000002, productName: "Coffee Body Scrub", status: "Aktif", batchId: "BATCH-823003", pin: null, ecc: "M" },
    ]);

    const [batches, setBatches] = useState([
        {
            id: "BATCH-823003", date: "10 Mar 2026, 08:00", productName: "Coffee Body Scrub", brandName: "PureNaturals", qty: 250,
            firstCode: "MKI-105-SCRB0001", lastCode: "MKI-105-SCRB0250", status: "Generated", settings: { ecc: "M", idLength: "8 Karakter", pin: "Tidak" }
        },
        {
            id: "BATCH-822002", date: "15 Jan 2026, 11:45", productName: "Gentle Facial Wash 100ml", brandName: "Glow & Co", qty: 2000,
            firstCode: "MKI-103-SUSP0001", lastCode: "MKI-103-SUSP2000", status: "Suspended", settings: { ecc: "H", idLength: "10 Karakter", pin: "Ya (6 Digit)" }
        },
        {
            id: "BATCH-821001", date: "05 Okt 2025, 14:30", productName: "Acne Fighter Night Cream", brandName: "DermaBeauty", qty: 500,
            firstCode: "MKI-102-IJKL9012", lastCode: "MKI-102-XYZW9999", status: "Generated", settings: { ecc: "L", idLength: "8 Karakter", pin: "Tidak" }
        },
        {
            id: "BATCH-820001", date: "01 Okt 2025, 09:15", productName: "Luxury Rose EDP 30ml", brandName: "Luxe Scents", qty: 1000,
            firstCode: "MKI-101-ABCD1234", lastCode: "MKI-101-ZZZZ8888", status: "Generated", settings: { ecc: "M", idLength: "8 Karakter", pin: "Ya (6 Digit)" }
        }
    ]);

    // --- STATE FORM ---
    const [brandInput, setBrandInput] = useState(createEmptyBrandInput());
    const [savingBrandStatusId, setSavingBrandStatusId] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [editingBrandId, setEditingBrandId] = useState(null);

    const [userInput, setUserInput] = useState({ name: '', email: '', role: 'Brand Owner', password: '' });
    const [editingUserId, setEditingUserId] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ userId: null, userName: '', newPassword: '', confirmPassword: '' });

    const [tagConfig, setTagConfig] = useState({
        productId: '', quantity: 100, idLength: 8, usePin: true, pinLength: 6, errorCorrection: 'M'
    });
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [generatedQR, setGeneratedQR] = useState(null);

    const [productInput, setProductInput] = useState({
        name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '',
        dynamicFields: {} // State baru untuk menyimpan inputan dinamis
    });
    const [editingProductId, setEditingProductId] = useState(null);

    const [selectedCatL1, setSelectedCatL1] = useState(null);
    const [selectedCatL2, setSelectedCatL2] = useState(null);
    const [newCatL1Name, setNewCatL1Name] = useState('');
    const [newCatL2Name, setNewCatL2Name] = useState('');
    const [newCatL3Name, setNewCatL3Name] = useState('');

    // --- STATE PENGATURAN ---
    const [requireGps, setRequireGps] = useState(true);
    const [emailNotif, setEmailNotif] = useState(false);

    // --- STATE UNTUK FILTER SCAN ---
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    // --- LOGIC HANDLERS BRAND ---
    const closeBrandModal = () => {
        setBrandInput(createEmptyBrandInput());
        setLogoFile(null);
        setLogoPreview(null);
        setEditingBrandId(null);
        setIsBrandModalOpen(false);
    };

    const openCreateBrandModal = () => {
        closeBrandModal();
        setIsBrandModalOpen(true);
    };

    const toggleBrandStatusAutoSave = (brand) => {
        const previousStatus = normalizeBrandStatus(brand.status);
        const newStatus = previousStatus === 1 ? 0 : 1;

        setSavingBrandStatusId(brand.id);
        setBrands((currentBrands) =>
            currentBrands.map((currentBrand) =>
                currentBrand.id === brand.id ? { ...currentBrand, status: newStatus } : currentBrand
            )
        );

        if (editingBrandId === brand.id) {
            setBrandInput((currentInput) => ({ ...currentInput, status: newStatus }));
        }

        axios.post(`/brands/update/${brand.id}`, {
            name: brand.name,
            owner_name: brand.owner_name || '',
            description: brand.description || '',
            status: newStatus,
        })
            .then((response) => {
                const savedBrand = normalizeBrandRecord(response?.data?.brand || { ...brand, status: newStatus });

                setBrands((currentBrands) =>
                    currentBrands.map((currentBrand) =>
                        currentBrand.id === brand.id ? savedBrand : currentBrand
                    )
                );

                if (editingBrandId === brand.id) {
                    setBrandInput((currentInput) => ({
                        ...currentInput,
                        name: savedBrand.name || currentInput.name,
                        owner_name: savedBrand.owner_name || '',
                        description: savedBrand.description || '',
                        status: normalizeBrandStatus(savedBrand.status),
                    }));
                }

                showToast(`Status Brand diubah menjadi ${getBrandStatusLabel(savedBrand.status)}`);
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};

                setBrands((currentBrands) =>
                    currentBrands.map((currentBrand) =>
                        currentBrand.id === brand.id ? { ...currentBrand, status: previousStatus } : currentBrand
                    )
                );
                if (editingBrandId === brand.id) {
                    setBrandInput((currentInput) => ({ ...currentInput, status: previousStatus }));
                }
                showToast(getFirstErrorMessage(errors, `Gagal mengubah status ${brand.name}.`), "error");
            })
            .finally(() => {
                setSavingBrandStatusId(null);
            });
    };

    const handleSaveBrand = (e) => {
        e.preventDefault();
        const brandName = brandInput.name.trim();

        if (!brandName) {
            showToast("Nama brand wajib diisi.", "error");
            return;
        }

        const formData = new FormData();
        formData.append('name', brandName);
        formData.append('owner_name', brandInput.owner_name.trim());
        formData.append('description', brandInput.description.trim());
        formData.append('status', String(normalizeBrandStatus(brandInput.status)));
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        const isEditing = Boolean(editingBrandId);

        if (!isEditing) {
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            formData.append('brand_code', `CL-${randomCode}`);
        }

        const targetUrl = isEditing ? `/brands/update/${editingBrandId}` : '/brands';

        axios.post(targetUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                const savedBrand = normalizeBrandRecord(response?.data?.brand || {});

                if (savedBrand.id) {
                    if (isEditing) {
                        setBrands((currentBrands) =>
                            currentBrands.map((currentBrand) =>
                                currentBrand.id === savedBrand.id ? savedBrand : currentBrand
                            )
                        );
                    } else {
                        setBrands((currentBrands) => [savedBrand, ...currentBrands]);
                    }
                }

                showToast(isEditing ? "Data brand berhasil diperbarui!" : "Brand baru berhasil ditambahkan!");
                closeBrandModal();
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(
                    getFirstErrorMessage(errors, isEditing ? "Gagal memperbarui data brand." : "Gagal menambahkan brand baru."),
                    "error"
                );
            });
    };

    const handleEditBrand = (brand) => {
        setBrandInput({
            name: brand.name || '',
            description: brand.description === "-" ? "" : (brand.description || ''),
            owner_name: brand.owner_name || '',
            status: normalizeBrandStatus(brand.status),
        });
        setEditingBrandId(brand.id);
        setLogoFile(null);
        setLogoPreview(brand.logo_url ? `/storage/${brand.logo_url}` : null);
        setIsBrandModalOpen(true);
    };

    const handleDeleteBrand = (id) => {
        setConfirmObj({
            isOpen: true,
            title: "Hapus Brand?",
            message: "Data brand ini akan dihapus permanen. Produk yang terkait mungkin akan kehilangan referensi. Lanjutkan?",
            onConfirm: () => {
                axios.delete(`/brands/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        setBrands((currentBrands) =>
                            currentBrands.filter((currentBrand) => Number(currentBrand.id) !== deletedId)
                        );

                        if (editingBrandId === deletedId) {
                            closeBrandModal();
                        }

                        showToast("Brand berhasil dihapus!");
                    })
                    .catch((error) => {
                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus brand."), "error");
                    });
            }
        });
    };

    const handleCancelEditBrand = () => {
        closeBrandModal();
    };

    // --- LOGIC HANDLERS PRODUCT ---
    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (!productInput.name || !productInput.brandId || !productInput.catL3 || !productInput.skuCode) {
            showToast("Mohon lengkapi data wajib produk (Nama, Brand, Kategori, Kode SKU).", "error");
            return;
        }

        // --- CEK SKU KEMBAR (DUPLIKAT) ---
        const isDuplicateSKU = products.some(
            (p) =>
                p.skuCode.toUpperCase() === productInput.skuCode.toUpperCase() &&
                p.id !== editingProductId // Jangan cek produk itu sendiri jika sedang diedit
        );

        if (isDuplicateSKU) {
            showToast(`Kode SKU "${productInput.skuCode.toUpperCase()}" sudah digunakan oleh produk lain! Harap gunakan kode unik.`, "error");
            return; // Hentikan proses simpan
        }
        // ---------------------------------

        const brandName = brands.find(b => b.id == productInput.brandId)?.name;
        const cat1 = categories.find(c => c.id == productInput.catL1);
        const cat2 = cat1?.subCategories.find(c => c.id == productInput.catL2);
        const cat3 = cat2?.subSubCategories.find(c => c.id == productInput.catL3);
        const categoryPath = `${cat1?.name} > ${cat2?.name} > ${cat3?.name}`;

        if (editingProductId) {
            setProducts(products.map(p => p.id === editingProductId ? {
                ...p,
                name: productInput.name,
                brandId: Number(productInput.brandId),
                brandName,
                description: productInput.description || '-',
                categoryPath,
                catL1: productInput.catL1,
                catL2: productInput.catL2,
                catL3: productInput.catL3,
                skuCode: productInput.skuCode.toUpperCase(),
                dynamicFields: productInput.dynamicFields || {} // Simpan data dinamis
            } : p));
            showToast("SKU Produk berhasil diperbarui!");
        } else {
            const newProduct = {
                ...productInput,
                id: Date.now(),
                brandId: Number(productInput.brandId),
                brandName,
                description: productInput.description || '-',
                categoryPath: categoryPath,
                skuCode: productInput.skuCode.toUpperCase(),
                dynamicFields: productInput.dynamicFields || {} // Simpan data dinamis
            };
            setProducts([...products, newProduct]);
            showToast("SKU Produk baru berhasil ditambahkan!");
        }
        setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
        setEditingProductId(null);
        setActiveTab('product');
    };

    const handleEditProduct = (product) => {
        setProductInput({
            name: product.name,
            brandId: product.brandId,
            description: product.description === "-" ? "" : product.description,
            catL1: product.catL1,
            catL2: product.catL2,
            catL3: product.catL3,
            skuCode: product.skuCode || '',
            dynamicFields: product.dynamicFields || {} // Tarik data dinamis saat edit
        });
        setEditingProductId(product.id);
        setActiveTab('product_form');
    };

    const handleCancelEditProduct = () => {
        setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
        setEditingProductId(null);
        setActiveTab('product');
    };

    const handleDeleteProduct = (id) => {
        setConfirmObj({
            isOpen: true,
            title: "Hapus SKU Produk?",
            message: "Data produk ini akan dihapus dari sistem secara permanen. Lanjutkan?",
            onConfirm: () => {
                setProducts(products.filter(p => p.id !== id));
                showToast("SKU Produk berhasil dihapus!");
            }
        });
    };

    // --- LOGIC HANDLERS USER ---
    const handleSaveUser = (e) => {
        e.preventDefault();
        if (!userInput.name || !userInput.email) return;

        if (editingUserId) {
            setSystemUsers(systemUsers.map(u => u.id === editingUserId ? { ...u, name: userInput.name, email: userInput.email, role: userInput.role } : u));
            showToast("Data pengguna berhasil diperbarui!");
        } else {
            if (!userInput.password) {
                showToast("Sandi wajib diisi untuk pengguna baru!", "error");
                return;
            }
            const newUser = { id: Date.now(), name: userInput.name, email: userInput.email, role: userInput.role, status: "Aktif" };
            setSystemUsers([...systemUsers, newUser]);
            showToast("Akun pengguna baru berhasil dibuat!");
        }
        setUserInput({ name: '', email: '', role: 'Brand Owner', password: '' });
        setEditingUserId(null);
        setIsUserModalOpen(false);
    };

    const handleEditUser = (user) => {
        setUserInput({ name: user.name, email: user.email, role: user.role, password: '' });
        setEditingUserId(user.id);
        setIsUserModalOpen(true);
    };

    const handleCancelEditUser = () => {
        setUserInput({ name: '', email: '', role: 'Brand Owner', password: '' });
        setEditingUserId(null);
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = (id) => {
        setConfirmObj({
            isOpen: true,
            title: "Hapus Akun Pengguna?",
            message: "Pengguna ini tidak akan bisa lagi login ke dalam sistem. Lanjutkan?",
            onConfirm: () => {
                setSystemUsers(systemUsers.filter(u => u.id !== id));
                showToast("Akun pengguna berhasil dihapus!");
            }
        });
    };

    const handleToggleUserStatus = (id) => {
        setSystemUsers(systemUsers.map(u => {
            if (u.id === id) {
                const newStatus = u.status === "Aktif" ? "Non-aktif" : "Aktif";
                showToast(`Akses pengguna berhasil di-${newStatus.toLowerCase()}`);
                return { ...u, status: newStatus };
            }
            return u;
        }));
    };

    const handleOpenPasswordModal = (user) => {
        setPasswordData({ userId: user.id, userName: user.name, newPassword: '', confirmPassword: '' });
        setIsPasswordModalOpen(true);
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Sandi tidak cocok! Silakan periksa kembali.", "error");
            return;
        }
        showToast(`Sandi untuk pengguna ${passwordData.userName} berhasil diperbarui!`);
        setIsPasswordModalOpen(false);
    };

    // --- LOGIC CATEGORY & TAGS ---
    const handleGenerateTags = (e) => {
        e.preventDefault();
        if (!tagConfig.productId) { showToast("Pilih produk terlebih dahulu!", "error"); return; }

        const qty = Number(tagConfig.quantity) || 1;
        const product = products.find(p => p.id == tagConfig.productId);
        const newBatchTags = [];
        const baseId = Date.now();
        const batchId = `BATCH-${baseId.toString().slice(-6)}`;

        for (let i = 0; i < qty; i++) {
            const randomStr = Math.random().toString(36).substring(2, 2 + tagConfig.idLength).toUpperCase();
            const finalRandom = randomStr.padEnd(tagConfig.idLength, 'X');
            const finalCode = `MKI-${product.id}-${finalRandom}`;

            let pin = null;
            if (tagConfig.usePin) {
                pin = Math.floor(Math.random() * Math.pow(10, tagConfig.pinLength)).toString().padStart(tagConfig.pinLength, '0');
            }

            newBatchTags.push({
                code: finalCode, productId: tagConfig.productId, id: baseId + i,
                productName: product.name, status: 'Aktif', batchId: batchId, pin: pin, ecc: tagConfig.errorCorrection
            });
        }

        setTags([...newBatchTags, ...tags]);

        const newBatchRecord = {
            id: batchId,
            date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
            productName: product.name, brandName: product.brandName, qty: qty,
            firstCode: newBatchTags[0].code, lastCode: newBatchTags[newBatchTags.length - 1].code, status: 'Generated',
            settings: { ecc: tagConfig.errorCorrection, idLength: `${tagConfig.idLength} Karakter`, pin: tagConfig.usePin ? `Ya (${tagConfig.pinLength} Digit)` : 'Tidak' }
        };

        setBatches([newBatchRecord, ...batches]);

        setGeneratedQR({
            code: newBatchTags[0].code, productName: product.name, count: qty, batchId: batchId,
            ecc: tagConfig.errorCorrection, idLength: tagConfig.idLength, usePin: tagConfig.usePin, pinLength: tagConfig.pinLength
        });

        setIsTagModalOpen(true);
    };

    const addCategory = (level) => {
        let name = '';
        let parentId = null;

        if (level === 1) {
            name = newCatL1Name.trim();
        } else if (level === 2 && selectedCatL1) {
            name = newCatL2Name.trim();
            parentId = selectedCatL1;
        } else if (level === 3 && selectedCatL2) {
            name = newCatL3Name.trim();
            parentId = selectedCatL2;
        }

        if (!name) {
            showToast("Nama kategori tidak boleh kosong.", "error");
            return;
        }

        axios.post('/product-categories', {
            name,
            parent_id: parentId,
        })
            .then((response) => {
                const createdCategory = response?.data?.category;
                if (!createdCategory?.id) {
                    showToast("Kategori berhasil ditambahkan, tetapi data respons tidak lengkap.", "error");
                    return;
                }

                const createdId = Number(createdCategory.id);
                const createdParentId = createdCategory.parent_id === null ? null : Number(createdCategory.parent_id);
                const createdName = createdCategory.name;
                const createdLevel = Number(createdCategory.level || level);

                setCategories((currentCategories) => {
                    if (createdLevel === 1) {
                        return [
                            ...currentCategories,
                            { id: createdId, name: createdName, subCategories: [] },
                        ];
                    }

                    if (createdLevel === 2) {
                        return currentCategories.map((catL1) => {
                            if (Number(catL1.id) !== createdParentId) return catL1;
                            return {
                                ...catL1,
                                subCategories: [
                                    ...(catL1.subCategories || []),
                                    { id: createdId, name: createdName, subSubCategories: [] },
                                ],
                            };
                        });
                    }

                    return currentCategories.map((catL1) => ({
                        ...catL1,
                        subCategories: (catL1.subCategories || []).map((catL2) => {
                            if (Number(catL2.id) !== createdParentId) return catL2;
                            return {
                                ...catL2,
                                subSubCategories: [
                                    ...(catL2.subSubCategories || []),
                                    { id: createdId, name: createdName },
                                ],
                            };
                        }),
                    }));
                });

                if (level === 1) setNewCatL1Name('');
                if (level === 2) setNewCatL2Name('');
                if (level === 3) setNewCatL3Name('');
                showToast("Kategori baru berhasil ditambahkan!");
            })
            .catch((error) => {
                const errors = error?.response?.data?.errors || {};
                showToast(getFirstErrorMessage(errors, "Gagal menambahkan kategori."), "error");
            });
    };

    const deleteCategory = (level, id) => {
        let title = "";
        let msg = "";
        if (level === 1) { title = "Hapus Kategori Utama?"; msg = "Semua sub-kategori di dalamnya akan ikut terhapus permanen."; }
        if (level === 2) { title = "Hapus Sub Kategori?"; msg = "Semua varian di dalamnya akan ikut terhapus permanen."; }
        if (level === 3) { title = "Hapus Varian?"; msg = "Varian kategori ini akan dihapus secara permanen."; }

        setConfirmObj({
            isOpen: true,
            title: title,
            message: msg,
            onConfirm: () => {
                axios.delete(`/product-categories/${id}`)
                    .then((response) => {
                        const deletedId = Number(response?.data?.deleted_id || id);

                        setCategories((currentCategories) => {
                            if (level === 1) {
                                return currentCategories.filter((catL1) => Number(catL1.id) !== deletedId);
                            }

                            if (level === 2) {
                                return currentCategories.map((catL1) => ({
                                    ...catL1,
                                    subCategories: (catL1.subCategories || []).filter((catL2) => Number(catL2.id) !== deletedId),
                                }));
                            }

                            return currentCategories.map((catL1) => ({
                                ...catL1,
                                subCategories: (catL1.subCategories || []).map((catL2) => ({
                                    ...catL2,
                                    subSubCategories: (catL2.subSubCategories || []).filter((catL3) => Number(catL3.id) !== deletedId),
                                })),
                            }));
                        });

                        if (level === 1 && Number(selectedCatL1) === deletedId) {
                            setSelectedCatL1(null);
                            setSelectedCatL2(null);
                        } else if (level === 2 && Number(selectedCatL2) === deletedId) {
                            setSelectedCatL2(null);
                        }

                        showToast("Kategori berhasil dihapus!");
                    })
                    .catch((error) => {
                        const errors = error?.response?.data?.errors || {};
                        showToast(getFirstErrorMessage(errors, "Gagal menghapus kategori."), "error");
                    });
            }
        });
    };

    // --- UI COMPONENTS ---

    const DashboardView = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Selamat datang di Dashboard Admin. Pantau ringkasan operasional, total master data, dan statistik aktivitas scan tag di sini." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Brand" value={brands.length} icon={Building2} color="bg-[#C1986E]" />
                    <StatCard title="Total SKU Produk" value={products.length} icon={Package} color="bg-emerald-500" />
                    <StatCard title="Tag QR Aktif" value={tags.length} icon={Tag} color="bg-purple-500" />
                    <StatCard title="Scan Validasi" value="1.248" icon={ScanLine} color="bg-blue-500" />
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Activity size={18} className="text-[#C1986E]" /> Grafik Aktivitas Scan
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">7 Hari Terakhir</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-100">
                                <TrendingUp size={16} /> +12.5%
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col mt-6">
                            <div className="relative h-48 w-full flex">
                                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium pointer-events-none z-0">
                                    <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">1.200</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                                    <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">900</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                                    <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">600</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                                    <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">300</span><div className="flex-1 border-t border-slate-100 border-dashed"></div></div>
                                    <div className="flex items-center gap-3 w-full"><span className="w-8 text-right">0</span><div className="flex-1 border-t border-slate-200"></div></div>
                                </div>

                                <div className="flex-1 flex items-end gap-3 sm:gap-6 pl-12 z-10 pb-[1px]">
                                    {[
                                        { day: 'Sen', val: 40, label: '480' },
                                        { day: 'Sel', val: 65, label: '780' },
                                        { day: 'Rab', val: 45, label: '540' },
                                        { day: 'Kam', val: 80, label: '960' },
                                        { day: 'Jum', val: 55, label: '660' },
                                        { day: 'Sab', val: 95, label: '1.140' },
                                        { day: 'Min', val: 30, label: '360' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex-1 h-full flex flex-col justify-end group cursor-pointer relative">
                                            <Tooltip text={`${item.label} Scans`} position="top" wrapperClass="w-full h-full flex items-end justify-center">
                                                <div className="absolute inset-0 w-full h-full bg-slate-50/30 rounded-t-sm transition-colors group-hover:bg-slate-100/50 pointer-events-none"></div>
                                                <div
                                                    className="w-full bg-gradient-to-t from-[#C1986E] to-[#e6bd95] rounded-t-sm transition-opacity duration-300 group-hover:opacity-80 animate-bar"
                                                    style={{ height: `${item.val}%`, animationDelay: `${idx * 100}ms` }}
                                                ></div>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-6 pl-12 mt-3">
                                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
                                    <div key={idx} className="flex-1 text-center text-[10px] sm:text-xs font-medium text-slate-500">{day}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <MapPin size={18} className="text-[#C1986E]" /> Sistem Pelacakan Distribusi
                            </h3>
                            <Tooltip text="Live Data" position="left">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse cursor-help"></div>
                            </Tooltip>
                        </div>
                        <div className="w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden border border-slate-200 z-0 shadow-inner">
                            <LeafletMap />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const BrandManager = () => {
        const filteredBrands = brands.filter(b =>
            b.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            (b.brand_code && b.brand_code.toLowerCase().includes(globalSearch.toLowerCase())) ||
            (b.owner_name && b.owner_name.toLowerCase().includes(globalSearch.toLowerCase())) ||
            (b.description && b.description.toLowerCase().includes(globalSearch.toLowerCase()))
        ).sort((a, b) => {
            const dir = brandSort.direction === 'asc' ? 1 : -1;
            if (brandSort.key === 'name') return a.name.localeCompare(b.name) * dir;
            if (brandSort.key === 'status') {
                if (a.status === b.status) return 0;
                return (normalizeBrandStatus(a.status) === 1 ? -1 : 1) * dir;
            }
            if (brandSort.key === 'sku') {
                const countA = products.filter(p => Number(p.brandId) === a.id).length;
                const countB = products.filter(p => Number(p.brandId) === b.id).length;
                return (countA - countB) * dir;
            }
            if (brandSort.key === 'owner') {
                const ownerA = a.owner_name || '';
                const ownerB = b.owner_name || '';
                return ownerA.localeCompare(ownerB) * dir;
            }
            return (a.id - b.id) * dir;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Halaman ini digunakan untuk mengelola data master Brand. Klik pada judul kolom di tabel untuk mengurutkan data." />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Total: {filteredBrands.length} Brand Terdaftar</span>
                    </div>
                    <button
                        onClick={openCreateBrandModal}
                        className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Tambah Brand Baru
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto [scrollbar-gutter:stable]">
                    <table className="w-full min-w-[980px] table-fixed text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="w-[34%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', brandSort, setBrandSort)}>
                                    <div className="flex items-center gap-2">Info Brand <SortIcon columnKey="name" sortConfig={brandSort} /></div>
                                </th>
                                <th className="w-[24%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('owner', brandSort, setBrandSort)}>
                                    <div className="flex items-center gap-2">Pemilik (Brand Owner) <SortIcon columnKey="owner" sortConfig={brandSort} /></div>
                                </th>
                                <th className="w-[14%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('sku', brandSort, setBrandSort)}>
                                    <div className="flex items-center gap-2">Jumlah SKU <SortIcon columnKey="sku" sortConfig={brandSort} /></div>
                                </th>
                                <th className="w-[14%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', brandSort, setBrandSort)}>
                                    <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={brandSort} /></div>
                                </th>
                                <th className="w-[14%] px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBrands.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada brand yang sesuai dengan pencarian.</td></tr>
                            ) : (
                                filteredBrands.map((brand) => {
                                    const productCount = products.filter(p => Number(p.brandId) === brand.id).length;
                                    const ownerName = brand.owner_name || '';

                                    return (
                                        <tr key={brand.id} className={`transition-colors ${isBrandActive(brand.status) ? 'hover:bg-slate-50' : 'bg-slate-50/50 grayscale-[20%]'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                                                        {brand.logo_url ? (
                                                            <img
                                                                src={`/storage/${brand.logo_url}`}
                                                                alt="Logo"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon size={18} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-medium text-sm truncate ${isBrandActive(brand.status) ? 'text-slate-800' : 'text-slate-500'}`}>{brand.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                                            {brand.brand_code || `ID-${brand.id}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ownerName ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>{ownerName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum ditetapkan</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex min-w-[90px] justify-center bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
                                                    {productCount} Produk
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isBrandActive(brand.status) ? (
                                                    <span className="inline-flex min-w-[94px] justify-center bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full items-center gap-1">
                                                        <CheckCircle2 size={12} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex min-w-[94px] justify-center bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-full items-center gap-1">
                                                        <X size={12} /> Non-aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Tooltip text={isBrandActive(brand.status) ? "Nonaktifkan Brand" : "Aktifkan Brand"} position="top">
                                                        <ToggleSwitch
                                                            checked={isBrandActive(brand.status)}
                                                            disabled={savingBrandStatusId === brand.id}
                                                            onChange={() => toggleBrandStatusAutoSave(brand)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip text="Edit Brand" position="top">
                                                        <button
                                                            onClick={() => handleEditBrand(brand)}
                                                            className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Hapus Brand" position="top">
                                                        <button
                                                            onClick={() => handleDeleteBrand(brand.id)}
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Tambah/Edit Brand */}
                {isBrandModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={handleCancelEditBrand} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                    {editingBrandId ? <Edit size={18} className="text-[#C1986E]" /> : <Building2 size={18} className="text-[#C1986E]" />}
                                    {editingBrandId ? "Edit Data Brand" : "Registrasi Brand Baru"}
                                </h3>
                                <button onClick={handleCancelEditBrand} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSaveBrand} className="flex flex-col overflow-hidden">
                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">

                                        {/* Area Upload Logo (Rasio 1:1) */}
                                        {/* KOTAK UPLOAD LOGO YANG SUDAH BERFUNGSI */}
                                        <label className="w-full sm:w-40 aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 flex-shrink-0 relative overflow-hidden">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setLogoFile(file);
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />

                                            {/* Jika ada preview gambar, tampilkan gambarnya. Jika tidak, tampilkan ikon cloud */}
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                                            ) : (
                                                <>
                                                    <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                        <UploadCloud className="group-hover:text-[#C1986E]" size={20} />
                                                    </div>
                                                    <span className="text-[11px] font-medium text-center px-2">Logo Brand</span>
                                                    <span className="text-[9px] text-slate-300 mt-1">(1:1 Ratio)</span>
                                                </>
                                            )}
                                        </label>

                                        <div className="flex-1 w-full space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Brand</label>
                                                <input
                                                    type="text"
                                                    placeholder="Contoh: BeautyCare ID"
                                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow text-sm"
                                                    value={brandInput.name}
                                                    onChange={(e) => setBrandInput({ ...brandInput, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pemilik Brand (Brand Owner)</label>
                                                <select
                                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                                                    value={brandInput.owner_name}
                                                    onChange={(e) => setBrandInput({ ...brandInput, owner_name: e.target.value })}
                                                >
                                                    <option value="">-- Pilih Pemilik (Opsional) --</option>
                                                    {systemUsers.filter(u => u.role === "Brand Owner").map(user => (
                                                        <option key={user.id} value={user.name}>{user.name} ({user.email})</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-slate-400">Pilih pengguna yang akan memiliki akses ke data analitik brand ini.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi / Catatan</label>
                                        <textarea
                                            rows="3"
                                            placeholder="Deskripsi singkat brand atau catatan khusus..."
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] transition-shadow resize-none text-sm"
                                            value={brandInput.description}
                                            onChange={(e) => setBrandInput({ ...brandInput, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                                    <button type="button" onClick={handleCancelEditBrand} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">{editingBrandId ? "Simpan Perubahan" : "Simpan Brand"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const CategoryManager = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Anda dapat menambah, menghapus, atau mengubah struktur kategori produk. Perubahan di sini akan mempengaruhi formulir input produk secara real-time." />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[350px] lg:h-full">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700">1. Kategori Utama</h3>
                        </div>
                        <div className="p-3 border-b border-slate-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Tambah Baru..."
                                    className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E]"
                                    value={newCatL1Name}
                                    onChange={(e) => setNewCatL1Name(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addCategory(1);
                                    }}
                                />
                                <button
                                    onClick={() => addCategory(1)}
                                    className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {categories.map(c1 => (
                                <div
                                    key={c1.id}
                                    onClick={() => {
                                        if (selectedCatL1 === c1.id) {
                                            setSelectedCatL1(null);
                                            setSelectedCatL2(null);
                                        } else {
                                            setSelectedCatL1(c1.id);
                                            setSelectedCatL2(null);
                                        }
                                    }}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL1 === c1.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <span>{c1.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${selectedCatL1 === c1.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c1.subCategories.length})</span>
                                        {selectedCatL1 === c1.id && (
                                            <Tooltip text="Hapus Kategori Utama" position="left">
                                                <button onClick={(e) => { e.stopPropagation(); deleteCategory(1, c1.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL1 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-700">2. Sub Kategori</h3>
                        </div>
                        <div className="p-3 border-b border-slate-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={selectedCatL1 ? "Tambah Sub..." : "Pilih Utama dulu"}
                                    className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    value={newCatL2Name}
                                    onChange={(e) => setNewCatL2Name(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && selectedCatL1) addCategory(2);
                                    }}
                                    disabled={!selectedCatL1}
                                />
                                <button
                                    onClick={() => addCategory(2)}
                                    className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!selectedCatL1}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {selectedCatL1 && categories.find(c => c.id === selectedCatL1)?.subCategories.map(c2 => (
                                <div
                                    key={c2.id}
                                    onClick={() => {
                                        if (selectedCatL2 === c2.id) setSelectedCatL2(null);
                                        else setSelectedCatL2(c2.id);
                                    }}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL2 === c2.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                                >
                                    <span>{c2.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${selectedCatL2 === c2.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c2.subSubCategories.length})</span>
                                        {selectedCatL2 === c2.id && (
                                            <Tooltip text="Hapus Sub Kategori" position="left">
                                                <button onClick={(e) => { e.stopPropagation(); deleteCategory(2, c2.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL2 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-700">3. Varian / Jenis</h3>
                        </div>
                        <div className="p-3 border-b border-slate-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={selectedCatL2 ? "Tambah Varian..." : "Pilih Sub dulu"}
                                    className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    value={newCatL3Name}
                                    onChange={(e) => setNewCatL3Name(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && selectedCatL1 && selectedCatL2) addCategory(3);
                                    }}
                                    disabled={!selectedCatL2}
                                />
                                <button
                                    onClick={() => addCategory(3)}
                                    className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!selectedCatL2}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {selectedCatL1 && selectedCatL2 &&
                                categories.find(c => c.id === selectedCatL1)?.subCategories.find(s => s.id === selectedCatL2)?.subSubCategories.map(c3 => (
                                    <div
                                        key={c3.id}
                                        className="flex justify-between items-center p-3 rounded-lg text-sm bg-white border border-slate-100 text-slate-700 hover:border-[#C1986E]/30 transition-colors"
                                    >
                                        <span>{c3.name}</span>
                                        <Tooltip text="Hapus Varian SKU" position="left">
                                            <button onClick={() => deleteCategory(3, c3.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                <Trash2 size={14} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                ))}
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    const ProductFormView = () => {
        // --- SAFEGUARD --- Memastikan dynamicFields selalu berupa objek
        const currentDynamicFields = productInput.dynamicFields || {};

        // --- HELPER SCROLL KE SEKSI FORM ---
        const scrollToSection = (sectionId) => {
            setActiveFormSection(sectionId);
            const element = document.getElementById(`form-${sectionId}`);
            if (element) {
                // Karena wadah utama sekarang adalah overflow-y-auto, kita gunakan scrollIntoView
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        // --- LOGIKA UNTUK MODAL KATEGORI ---
        const getFlattenedCategories = () => {
            let paths = [];
            categories.forEach(c1 => {
                c1.subCategories.forEach(c2 => {
                    c2.subSubCategories.forEach(c3 => {
                        if (!catSearchKeyword ||
                            c1.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c2.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c3.name.toLowerCase().includes(catSearchKeyword.toLowerCase())) {
                            paths.push({ l1: c1.id, l2: c2.id, l3: c3.id, path: `${c1.name} > ${c2.name} > ${c3.name}` });
                        }
                    });
                });
            });
            return paths;
        };

        const getSelectedCategoryText = (l1, l2, l3) => {
            if (!l1) return "Pilih Kategori Produk";
            const c1 = categories.find(c => c.id == l1);
            const c2 = c1?.subCategories.find(c => c.id == l2);
            const c3 = c2?.subSubCategories.find(c => c.id == l3);
            if (!c1) return "Kategori Tidak Valid";
            return `${c1.name}${c2 ? ` > ${c2.name}` : ''}${c3 ? ` > ${c3.name}` : ''}`;
        };

        const handleConfirmCategory = () => {
            setProductInput({
                ...productInput,
                catL1: tempCategory.l1,
                catL2: tempCategory.l2,
                catL3: tempCategory.l3,
                // Reset dynamic fields jika kategori berubah
                dynamicFields: (productInput.catL2 != tempCategory.l2) ? {} : productInput.dynamicFields
            });
            setIsCategoryModalOpen(false);
        };

        const openCategoryModal = () => {
            setTempCategory({ l1: productInput.catL1 || '', l2: productInput.catL2 || '', l3: productInput.catL3 || '' });
            setCatSearchKeyword('');
            setIsCategoryModalOpen(true);
        };

        return (
            <div className="animate-in fade-in duration-500 pb-20">

                {/* Header Form & Navigasi Sticky - Full Width sejajar dengan Buttons */}
                <div className="sticky top-[-16px] md:top-[-32px] z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 mb-8 shadow-sm">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 md:pt-6">

                        {/* Tab Navigasi */}
                        <div className="flex gap-6 overflow-x-auto hide-scrollbar-mobile w-full sm:w-auto">
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('info'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'info' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Informasi Produk</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('spec'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'spec' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Spesifikasi</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('desc'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'desc' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Deskripsi</button>
                        </div>

                        {/* Buttons Action */}
                        <div className="flex items-center gap-3 w-full sm:w-auto pb-3">
                            <button type="button" onClick={handleCancelEditProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm hidden sm:block">Batal</button>
                            <button onClick={handleSaveProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2">
                                <Package size={16} /> Simpan
                            </button>
                        </div>

                    </div>
                </div>

                {/* Pembungkus Max Width untuk Area Form Utama */}
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSaveProduct} className="space-y-8 flex flex-col">

                        {/* BAGIAN 1: INFORMASI PRODUK */}
                        {/* scroll-mt-44 digunakan agar judul form tidak tertutup navbar sticky saat di scroll otomatis */}
                        <div id="form-info" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <Info size={18} className="text-[#C1986E]" /> Informasi Dasar Produk
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Kiri: Upload Gambar (Rasio 1:1) */}
                                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                                    <div className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 text-center relative overflow-hidden">
                                        <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <UploadCloud size={28} className="text-slate-400 group-hover:text-[#C1986E]" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 mb-1">Pilih / Tarik Foto</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                                        Format: JPG, PNG, WEBP<br />Ukuran Maksimal: 2MB<br />Rasio Gambar: 1:1 (Persegi)
                                    </div>
                                </div>

                                {/* Kanan: Form Inputan Utama */}
                                <div className="flex-1 w-full space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Produk <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Sabun Cuci Muka Glowing 100ml"
                                            maxLength={255}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white"
                                            value={productInput.name}
                                            onChange={(e) => setProductInput({ ...productInput, name: e.target.value })}
                                            required
                                        />
                                        <div className="text-right text-[10px] text-slate-400">{productInput.name.length}/255 Karakter</div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                                <span>Kode SKU <span className="text-red-500">*</span></span>
                                                <Tooltip text="Stock Keeping Unit (Kode Unik Internal Produk)"><Info size={14} className="text-slate-400 cursor-help" /></Tooltip>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: GLW-FW-100"
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm font-mono uppercase bg-slate-50/50 hover:bg-white"
                                                value={productInput.skuCode || ''}
                                                onChange={(e) => setProductInput({ ...productInput, skuCode: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brand Utama <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white cursor-pointer"
                                                value={productInput.brandId || ''}
                                                onChange={(e) => setProductInput({ ...productInput, brandId: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled>-- Pilih Brand Terdaftar --</option>
                                                {brands.filter(b => isBrandActive(b.status)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori Produk <span className="text-red-500">*</span></label>
                                        <div
                                            onClick={openCategoryModal}
                                            className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all text-sm group ${productInput.catL3 ? 'border-[#C1986E] bg-[#C1986E]/5 text-[#C1986E]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#C1986E]/50 text-slate-500'}`}
                                        >
                                            <div className="flex flex-col">
                                                {productInput.catL3 ? (
                                                    <>
                                                        <span className="font-semibold text-slate-800">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3).split(' > ').pop()}</span>
                                                        <span className="text-[10px] text-[#C1986E] mt-0.5">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">Klik untuk mengatur kategori...</span>
                                                )}
                                            </div>
                                            <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${productInput.catL3 ? 'text-[#C1986E]' : 'text-slate-400'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BAGIAN 2: SPESIFIKASI DINAMIS */}
                        <div id="form-spec" className="scroll-mt-44">
                            {PRODUCT_SPEC_SCHEMA[productInput.catL2] ? (() => {
                                const schema = PRODUCT_SPEC_SCHEMA[productInput.catL2];
                                const IconCmp = schema.icon;
                                return (
                                    <div className={`rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 border shadow-sm bg-white ${schema.theme.border}`}>
                                        <h3 className={`font-bold flex items-center gap-2 text-base border-b border-slate-100 pb-3 ${schema.theme.title}`}>
                                            <IconCmp size={18} /> {schema.title}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {schema.fields.map((field) => (
                                                <div key={field.name} className={`space-y-1.5 ${field.colSpan === 2 ? 'md:col-span-2' : ''}`}>
                                                    <label className={`text-xs font-bold uppercase tracking-wide ${schema.theme.label}`}>{field.label}</label>
                                                    {field.type === 'select' ? (
                                                        <select
                                                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-sm bg-slate-50/50 hover:bg-white border transition-colors cursor-pointer ${schema.theme.input}`}
                                                            value={currentDynamicFields[field.name] || ''}
                                                            onChange={(e) => setProductInput({ ...productInput, dynamicFields: { ...currentDynamicFields, [field.name]: e.target.value } })}
                                                        >
                                                            <option value="">-- Pilih --</option>
                                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder={field.placeholder}
                                                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-sm bg-slate-50/50 hover:bg-white border transition-colors ${schema.theme.input}`}
                                                            value={currentDynamicFields[field.name] || ''}
                                                            onChange={(e) => setProductInput({ ...productInput, dynamicFields: { ...currentDynamicFields, [field.name]: e.target.value } })}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400 text-sm shadow-sm flex flex-col items-center gap-2">
                                    <Database size={24} className="text-slate-300" />
                                    <p>Silakan pilih Kategori Produk terlebih dahulu untuk memunculkan form spesifikasi yang sesuai.</p>
                                </div>
                            )}
                        </div>

                        {/* BAGIAN 3: DESKRIPSI */}
                        <div id="form-desc" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <FileText size={18} className="text-[#C1986E]" /> Deskripsi Produk
                            </h3>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Keterangan Detail / Manfaat / Panduan Penggunaan</span>
                                    <span className="text-[10px] text-slate-400 font-normal normal-case bg-slate-100 px-2 py-0.5 rounded">Opsional</span>
                                </label>
                                <textarea
                                    rows="6"
                                    placeholder="Tuliskan keterangan detail, manfaat, komposisi (ingredients), atau cara penggunaan produk yang nantinya dapat dibaca oleh pelanggan saat melakukan verifikasi..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all resize-y text-sm bg-slate-50/50 hover:bg-white leading-relaxed"
                                    value={productInput.description}
                                    onChange={(e) => setProductInput({ ...productInput, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- MODAL PICKER KATEGORI --- */}
                {isCategoryModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
                        onClick={() => setIsCategoryModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] sm:h-[70vh] animate-in zoom-in-95"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header & Search */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 flex-1 shadow-sm focus-within:border-[#C1986E] focus-within:ring-1 focus-within:ring-[#C1986E] transition-all">
                                    <Search size={18} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Cari kategori... (Contoh: Parfum, Wajah)"
                                        className="bg-transparent border-none outline-none text-sm w-full focus:ring-0"
                                        value={catSearchKeyword}
                                        onChange={(e) => setCatSearchKeyword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-hidden bg-white flex flex-col relative">
                                {catSearchKeyword ? (
                                    /* Tampilan Pencarian */
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                                        {getFlattenedCategories().length > 0 ? (
                                            getFlattenedCategories().map(item => (
                                                <div
                                                    key={item.path}
                                                    onClick={() => setTempCategory({ l1: item.l1, l2: item.l2, l3: item.l3 })}
                                                    className={`p-3 sm:px-4 rounded-xl cursor-pointer text-sm border transition-all ${tempCategory.l3 === item.l3 ? 'bg-[#C1986E]/10 border-[#C1986E]/30 text-[#C1986E] font-semibold' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
                                                >
                                                    {item.path}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 p-8 text-sm">Kategori tidak ditemukan.</div>
                                        )}
                                    </div>
                                ) : (
                                    /* Tampilan Cascading 3 Kolom */
                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Kolom 1 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">1. Induk Kategori</h5>
                                            {categories.map(c1 => (
                                                <div
                                                    key={c1.id}
                                                    onClick={() => setTempCategory({ l1: c1.id, l2: '', l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l1 == c1.id ? 'bg-slate-800 text-white font-medium shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    <span>{c1.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l1 == c1.id ? 'text-slate-400' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 2 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 bg-slate-50/30 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">2. Sub Kategori</h5>
                                            {!tempCategory.l1 && <p className="text-xs text-slate-400 px-2 italic">Pilih Induk Kategori dulu</p>}
                                            {tempCategory.l1 && categories.find(c => c.id == tempCategory.l1)?.subCategories.map(c2 => (
                                                <div
                                                    key={c2.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l2: c2.id, l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l2 == c2.id ? 'bg-white border border-[#C1986E] text-[#C1986E] font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'}`}
                                                >
                                                    <span>{c2.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l2 == c2.id ? 'text-[#C1986E]/50' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 3 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">3. Varian Akhir</h5>
                                            {!tempCategory.l2 && <p className="text-xs text-slate-400 px-2 italic">Pilih Sub Kategori dulu</p>}
                                            {tempCategory.l2 && categories.find(c => c.id == tempCategory.l1)?.subCategories.find(s => s.id == tempCategory.l2)?.subSubCategories.map(c3 => (
                                                <div
                                                    key={c3.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l3: c3.id })}
                                                    className={`p-3 rounded-xl cursor-pointer text-sm mb-1 transition-all ${tempCategory.l3 == c3.id ? 'bg-[#C1986E] text-white font-bold shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#C1986E]/50'}`}
                                                >
                                                    {c3.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="text-sm w-full sm:w-auto">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Kategori Terpilih:</span>
                                    <div className="font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 break-words line-clamp-2">
                                        {getSelectedCategoryText(tempCategory.l1, tempCategory.l2, tempCategory.l3)}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                                    <button
                                        onClick={handleConfirmCategory}
                                        disabled={!tempCategory.l3}
                                        className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ProductManager = () => {
        if (brands.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
                    <AlertCircle size={48} className="text-yellow-600" />
                    <h2 className="text-xl font-bold text-slate-800">Brand Belum Tersedia</h2>
                    <button onClick={() => setActiveTab('brand')} className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm">Pergi ke Menu Brand</button>
                </div>
            );
        }

        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.brandName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.categoryPath.toLowerCase().includes(globalSearch.toLowerCase())
        ).sort((a, b) => {
            const dir = productSort.direction === 'asc' ? 1 : -1;
            if (productSort.key === 'name') return a.name.localeCompare(b.name) * dir;
            if (productSort.key === 'category') return a.categoryPath.localeCompare(b.categoryPath) * dir;
            if (productSort.key === 'tags') {
                const tagsA = batches.filter(batch => batch.productName === a.name).reduce((sum, batch) => sum + batch.qty, 0);
                const tagsB = batches.filter(batch => batch.productName === b.name).reduce((sum, batch) => sum + batch.qty, 0);
                return (tagsA - tagsB) * dir;
            }
            return (a.id - b.id) * dir;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Kelola Master Data SKU Produk di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Total: {filteredProducts.length} Produk SKU</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProductId(null);
                            setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
                            setActiveTab('product_form');
                        }}
                        className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} /> Tambah SKU Baru
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Produk Info <SortIcon columnKey="name" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('sku', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Kode SKU <SortIcon columnKey="sku" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('category', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Kategori <SortIcon columnKey="category" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('tags', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Tag Dibuat <SortIcon columnKey="tags" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada produk yang sesuai dengan pencarian.</td></tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const tagCount = batches
                                        .filter(b => b.productName === product.name)
                                        .reduce((total, b) => total + b.qty, 0);

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="font-medium text-slate-800 text-sm truncate" title={product.name}>{product.name}</span>
                                                        <span className="text-xs text-[#C1986E] font-medium flex items-center gap-1 mt-0.5 truncate"><Building2 size={12} /> {product.brandName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                                                    {product.skuCode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-500 max-w-[220px] whitespace-normal" title={product.categoryPath}>
                                                    {product.categoryPath.split(' > ').map((p, i, arr) => (
                                                        <span key={i} className="inline-block">
                                                            {p} {i < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                                                    {new Intl.NumberFormat('id-ID').format(tagCount)} Tag
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Tooltip text="Lihat Detail Produk" position="top">
                                                        <button onClick={() => setSelectedProductDetail(product)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Edit Produk" position="top">
                                                        <button onClick={() => handleEditProduct(product)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Edit size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Hapus Data Produk" position="top">
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Detail Produk */}
                {selectedProductDetail && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedProductDetail(null)} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center z-10 sticky top-0">
                                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                    <Eye size={18} className="text-[#C1986E]" /> Detail Informasi Produk
                                </h3>
                                <button onClick={() => setSelectedProductDetail(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col md:flex-row gap-8">

                                    {/* Kolom Kiri: Visual & Statistik Utama */}
                                    <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                                        <div className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 shadow-inner">
                                            <ImageIcon size={48} className="mb-3 text-slate-300" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Foto</span>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5">Total Tag QR Dibuat</p>
                                            <p className="text-3xl font-extrabold text-blue-700 leading-none">
                                                {new Intl.NumberFormat('id-ID').format(
                                                    batches
                                                        .filter(b => b.productName === selectedProductDetail.name)
                                                        .reduce((total, b) => total + b.qty, 0)
                                                )}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 mt-1">Tag Keamanan</p>
                                        </div>
                                    </div>

                                    {/* Kolom Kanan: Detail Data SKU */}
                                    <div className="w-full md:w-2/3 flex flex-col">
                                        <div className="pb-5 border-b border-slate-100 mb-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-widest">
                                                    SKU: {selectedProductDetail.skuCode || 'NO-SKU'}
                                                </span>
                                            </div>
                                            <h4 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">{selectedProductDetail.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#C1986E] font-bold flex items-center gap-1.5 bg-[#C1986E]/10 w-fit px-3 py-1.5 rounded-lg border border-[#C1986E]/20">
                                                    <Building2 size={16} /> {selectedProductDetail.brandName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Detail Kategori (Breadcrumb Style) */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <Layers size={14} className="text-slate-400" /> Struktur Kategori
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {selectedProductDetail.categoryPath.split(' > ').map((item, index, arr) => (
                                                        <React.Fragment key={index}>
                                                            <span className={`text-xs px-3 py-1.5 rounded-lg shadow-sm border ${index === arr.length - 1
                                                                ? 'bg-slate-800 text-white font-medium border-slate-800'
                                                                : 'bg-white text-slate-600 border-slate-200 font-medium'
                                                                }`}>
                                                                {item}
                                                            </span>
                                                            {index < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Spesifikasi Dinamis */}
                                            {selectedProductDetail.dynamicFields && Object.keys(selectedProductDetail.dynamicFields).length > 0 && PRODUCT_SPEC_SCHEMA[selectedProductDetail.catL2] && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                        <Database size={14} className="text-slate-400" /> Spesifikasi Khusus
                                                    </p>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {PRODUCT_SPEC_SCHEMA[selectedProductDetail.catL2].fields.map(field => (
                                                            <div key={field.name} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{field.label}</p>
                                                                <p className="text-sm font-semibold text-slate-700">{selectedProductDetail.dynamicFields[field.name] || '-'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Deskripsi */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <FileText size={14} className="text-slate-400" /> Keterangan / Deskripsi Produk
                                                </p>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[120px] shadow-inner">
                                                    {selectedProductDetail.description || <span className="text-slate-400 italic">Tidak ada deskripsi yang ditambahkan untuk produk ini.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end z-10 sticky bottom-0">
                                <button type="button" onClick={() => setSelectedProductDetail(null)} className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm">
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const TagGenerator = () => {
        const handleDeleteBatch = (batchId) => {
            setConfirmObj({
                isOpen: true,
                title: "Hapus Batch Tag?",
                message: `Semua tag ID yang tergabung di dalam batch ${batchId} akan ikut terhapus dan tidak lagi valid. Lanjutkan?`,
                onConfirm: () => {
                    setBatches(batches.filter(b => b.id !== batchId));
                    setTags(tags.filter(t => t.batchId !== batchId));
                    showToast(`Data batch ${batchId} berhasil dihapus!`);
                }
            });
        };

        // FUNGSI BARU: Suspend / Aktifkan kembali Batch
        const handleToggleBatchStatus = (batchId, currentStatus) => {
            const isSuspending = currentStatus === 'Generated';
            setConfirmObj({
                isOpen: true,
                title: isSuspending ? "Suspend / Recall Batch?" : "Aktifkan Kembali Batch?",
                message: isSuspending
                    ? `PERINGATAN: Menonaktifkan batch ${batchId} akan membuat SEMUA tag di dalamnya berstatus INVALID/RECALL saat di-scan oleh pelanggan. Lanjutkan?`
                    : `Batch ${batchId} akan diaktifkan kembali dan tag di dalamnya akan kembali berstatus valid saat di-scan. Lanjutkan?`,
                onConfirm: () => {
                    setBatches(batches.map(b =>
                        b.id === batchId ? { ...b, status: isSuspending ? 'Suspended' : 'Generated' } : b
                    ));
                    showToast(`Status batch ${batchId} berhasil diubah!`);
                }
            });
        };

        const handlePrintBatch = (batchId) => {
            const batchTags = tags.filter(t => t.batchId === batchId);
            if (batchTags.length === 0) {
                showToast("Data tag untuk batch ini tidak ditemukan.", "error");
                return;
            }
            const printWindow = window.open('', '_blank');
            const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Layout - ${batchId}</title>
            <style>
              @page { size: 300mm 450mm; margin: 10mm; }
              body { margin: 0; padding: 0; font-family: sans-serif; background: white; -webkit-print-color-adjust: exact; color-adjust: exact; }
              #print-root { width: 100%; }
              .print-container { display: flex; flex-wrap: wrap; gap: 4mm; width: 100%; align-content: flex-start; }
              .tag-item { width: 30mm; height: 30mm; border: 1px dashed #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 2mm; page-break-inside: avoid; }
              .qr-mockup { width: 20mm; height: 20mm; margin-bottom: 1mm; display: flex; justify-content: center; align-items: center; }
              .qr-mockup svg { width: 100%; height: 100%; }
              .tag-code { font-size: 5px; font-family: monospace; text-align: center; word-break: break-all; font-weight: bold; letter-spacing: 0.5px; }
            </style>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/qrcode.react@3.1.0/lib/index.js"></script>
          </head>
          <body>
            <div id="print-root"></div>
            <script>
              window.onload = () => {
                const rootElement = document.getElementById('print-root');
                const root = ReactDOM.createRoot(rootElement);
                const tagsData = window.__BATCH_TAGS__ || [];
                const QRCodeComponent = window.QRCodeSVG || window.QRCode?.QRCodeSVG || window.QRCode;
                root.render(
                  React.createElement('div', { className: 'print-container' },
                    tagsData.map(tag => 
                      React.createElement('div', { className: 'tag-item', key: tag.code },
                        React.createElement('div', { className: 'qr-mockup' },
                           React.createElement(QRCodeComponent, { value: "https://mki-auth.com/verify/" + tag.code, level: tag.ecc || "M", renderAs: "svg", width: "100%", height: "100%" })
                        ),
                        React.createElement('div', { className: 'tag-code' }, tag.code)
                      )
                    )
                  )
                );
                setTimeout(() => { window.print(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
            const dataInjection = `<script>window.__BATCH_TAGS__ = ${JSON.stringify(batchTags)};</script>`;
            printWindow.document.write(htmlContent.replace('</head>', `${dataInjection}</head>`));
            printWindow.document.close();
        };

        const filteredBatches = batches.filter(b =>
            b.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
            b.productName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            b.brandName.toLowerCase().includes(globalSearch.toLowerCase())
        ).sort((a, b) => {
            const dir = batchSort.direction === 'asc' ? 1 : -1;
            if (batchSort.key === 'id') return a.id.localeCompare(b.id) * dir;
            if (batchSort.key === 'product') return a.productName.localeCompare(b.productName) * dir;
            if (batchSort.key === 'qty') return (a.qty - b.qty) * dir;
            if (batchSort.key === 'status') {
                if (a.status === b.status) return 0;
                return (a.status === 'Generated' ? -1 : 1) * dir;
            }
            return 0;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Gunakan fitur ini untuk membuat batch Tag QR secara massal. Konfigurasi PIN dan Error Correction dapat disesuaikan secara spesifik per batch." />
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <QrCode size={18} className="text-[#C1986E]" /> Konfigurasi Batch Baru
                    </h3>
                    <form onSubmit={handleGenerateTags} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Pilih Produk (SKU)</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm"
                                    value={tagConfig.productId}
                                    onChange={(e) => setTagConfig({ ...tagConfig, productId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Produk Terdaftar --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brandName})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Jumlah Tag (Quantity)</label>
                                <input
                                    type="number"
                                    min="1" max="10000"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                    value={tagConfig.quantity}
                                    onChange={(e) => setTagConfig({ ...tagConfig, quantity: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-3">Pengaturan Tag & Keamanan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Panjang ID Acak</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                                        value={tagConfig.idLength}
                                        onChange={(e) => setTagConfig({ ...tagConfig, idLength: Number(e.target.value) })}
                                    >
                                        <option value={8}>8 Karakter (Standar)</option>
                                        <option value={10}>10 Karakter</option>
                                        <option value={12}>12 Karakter</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 h-[42px]">
                                    <label className="text-sm font-medium text-slate-600">Gunakan PIN</label>
                                    <ToggleSwitch
                                        checked={tagConfig.usePin}
                                        onChange={() => setTagConfig({ ...tagConfig, usePin: !tagConfig.usePin })}
                                    />
                                </div>
                                {tagConfig.usePin && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Panjang PIN (Digit)</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                                            value={tagConfig.pinLength}
                                            onChange={(e) => setTagConfig({ ...tagConfig, pinLength: Number(e.target.value) })}
                                        >
                                            <option value={4}>4 Digit</option>
                                            <option value={6}>6 Digit</option>
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">QR Error Correction</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-white text-sm h-[42px]"
                                        value={tagConfig.errorCorrection}
                                        onChange={(e) => setTagConfig({ ...tagConfig, errorCorrection: e.target.value })}
                                    >
                                        <option value="M">Level M (15% recovery)</option>
                                        <option value="H">Level H (30% recovery)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="submit" className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-8 py-2.5 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2">
                                <Hash size={18} /> Generate Batch Sekarang
                            </button>
                        </div>
                    </form>
                </div>

                {/* TABEL RIWAYAT BATCH */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto mt-6">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Layers size={18} className="text-[#C1986E]" /> Riwayat Batch Generate
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-500">Total Tag Dibuat:</span>
                                <span className="text-sm font-bold text-[#C1986E]">
                                    {new Intl.NumberFormat('id-ID').format(filteredBatches.reduce((total, batch) => total + batch.qty, 0))}
                                </span>
                            </div>
                            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg">{filteredBatches.length} Batch</span>
                        </div>
                    </div>
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('id', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Batch ID & Info <SortIcon columnKey="id" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('product', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Produk SKU <SortIcon columnKey="product" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('qty', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Jumlah & Keamanan <SortIcon columnKey="qty" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', batchSort, setBatchSort)}>
                                    <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={batchSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBatches.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada riwayat batch yang ditemukan.</td></tr>
                            ) : (
                                filteredBatches.map(batch => (
                                    <tr key={batch.id} className={`transition-colors ${batch.status === 'Suspended' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">{batch.id}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">{batch.date}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 text-sm">{batch.productName}</p>
                                            <p className="text-xs text-[#C1986E] font-medium">{batch.brandName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-700">{batch.qty} <span className="text-xs font-normal text-slate-500">Tag</span></p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">PIN: {batch.settings.pin}</span>
                                                <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium border border-purple-100">ECC: {batch.settings.ecc}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {batch.status === 'Generated' ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                    <CheckCircle2 size={12} /> Aktif
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                    <AlertCircle size={12} /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Tooltip text={batch.status === 'Generated' ? "Suspend / Recall Batch" : "Aktifkan Kembali Batch"} position="top">
                                                    <button
                                                        onClick={() => handleToggleBatchStatus(batch.id, batch.status)}
                                                        className={`p-1.5 rounded-lg transition-all active:scale-95 ${batch.status === 'Generated' ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                    >
                                                        <AlertCircle size={16} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Print / Cetak Barcode" position="top">
                                                    <button onClick={() => handlePrintBatch(batch.id)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed" disabled={batch.status === 'Suspended'}>
                                                        <Printer size={16} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Hapus Seluruh Batch" position="top">
                                                    <button onClick={() => handleDeleteBatch(batch.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Berhasil Generate */}
                {isTagModalOpen && generatedQR && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setIsTagModalOpen(false)} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-emerald-50 p-6 flex flex-col items-center border-b border-emerald-100">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-emerald-800">Generate Berhasil!</h3>
                                <p className="text-sm text-emerald-600 mt-1">{generatedQR.count} Tag telah dibuat untuk {generatedQR.productName}.</p>
                            </div>
                            <div className="p-6 bg-slate-50">
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Batch ID</p>
                                <p className="font-mono text-sm bg-white border border-slate-200 py-2 rounded-lg text-slate-800 font-bold tracking-widest">{generatedQR.batchId}</p>
                            </div>
                            <div className="p-4 flex gap-3">
                                <button onClick={() => setIsTagModalOpen(false)} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Tutup</button>
                                <button onClick={() => { setIsTagModalOpen(false); handlePrintBatch(generatedQR.batchId); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2">
                                    <Printer size={16} /> Cetak Batch
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const UserManager = () => {
        const filteredUsers = systemUsers.filter(u =>
            u.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
            u.role.toLowerCase().includes(globalSearch.toLowerCase())
        ).sort((a, b) => {
            const dir = userSort.direction === 'asc' ? 1 : -1;
            if (userSort.key === 'name') return a.name.localeCompare(b.name) * dir;
            if (userSort.key === 'role') return a.role.localeCompare(b.role) * dir;
            if (userSort.key === 'status') {
                if (a.status === b.status) return 0;
                return (a.status === 'Aktif' ? -1 : 1) * dir;
            }
            return (a.id - b.id) * dir;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Kelola akses pengguna sistem di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', userSort, setUserSort)}>
                                    <div className="flex items-center gap-2">Informasi Pengguna <SortIcon columnKey="name" sortConfig={userSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('role', userSort, setUserSort)}>
                                    <div className="flex items-center gap-2">Role Akses <SortIcon columnKey="role" sortConfig={userSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', userSort, setUserSort)}>
                                    <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={userSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`transition-colors ${user.status === 'Aktif' ? 'hover:bg-slate-50' : 'bg-slate-50/50 grayscale-[20%]'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.status === 'Aktif' ? 'bg-[#C1986E]/10 text-[#C1986E]' : 'bg-slate-200 text-slate-500'}`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={`font-semibold text-sm ${user.status === 'Aktif' ? 'text-slate-800' : 'text-slate-500'}`}>{user.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${user.status === 'Aktif' ? (user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') : 'bg-slate-200 text-slate-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.status === "Aktif" ? (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                <CheckCircle2 size={12} /> Aktif
                                            </span>
                                        ) : (
                                            <span className="bg-slate-200 text-slate-500 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                                                <X size={12} /> Non-aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Tooltip text={user.status === "Aktif" ? "Nonaktifkan Akses" : "Aktifkan Akses"} position="top">
                                                <ToggleSwitch
                                                    checked={user.status === 'Aktif'}
                                                    onChange={() => handleToggleUserStatus(user.id)}
                                                />
                                            </Tooltip>
                                            <Tooltip text="Reset Sandi" position="top">
                                                <button onClick={() => handleOpenPasswordModal(user)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95"><Key size={16} /></button>
                                            </Tooltip>
                                            <Tooltip text="Edit User" position="top">
                                                <button onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95"><Edit size={16} /></button>
                                            </Tooltip>
                                            <Tooltip text="Hapus User" position="top">
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95"><Trash2 size={16} /></button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Ubah Password */}
                {isPasswordModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setIsPasswordModalOpen(false)} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                    <Key size={18} className="text-[#C1986E]" /> Ubah Sandi Pengguna
                                </h3>
                                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSavePassword} className="flex flex-col">
                                <div className="p-6 space-y-4">
                                    <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg border border-blue-100 mb-2">
                                        Mengubah sandi untuk pengguna: <strong>{passwordData.userName}</strong>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Sandi Baru</label>
                                        <input
                                            type="password"
                                            placeholder="Masukkan sandi baru"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Konfirmasi Sandi Baru</label>
                                        <input
                                            type="password"
                                            placeholder="Ketik ulang sandi baru"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">Simpan Sandi Baru</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Tambah/Edit User */}
                {isUserModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={handleCancelEditUser} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                    {editingUserId ? <Edit size={18} className="text-[#C1986E]" /> : <Users size={18} className="text-[#C1986E]" />}
                                    {editingUserId ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
                                </h3>
                                <button onClick={handleCancelEditUser} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSaveUser} className="flex flex-col">
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Masukkan nama pengguna"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                            value={userInput.name}
                                            onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Alamat Email</label>
                                        <input
                                            type="email"
                                            placeholder="email@perusahaan.com"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                            value={userInput.email}
                                            onChange={(e) => setUserInput({ ...userInput, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Role / Akses</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm bg-white"
                                            value={userInput.role}
                                            onChange={(e) => setUserInput({ ...userInput, role: e.target.value })}
                                        >
                                            <option value="Brand Owner">Brand Owner (Lihat Data Saja)</option>
                                            <option value="Super Admin">Super Admin (Akses Penuh)</option>
                                        </select>
                                    </div>
                                    {!editingUserId && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Sandi Awal</label>
                                            <input
                                                type="password"
                                                placeholder="Sandi untuk login pertama"
                                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                                value={userInput.password}
                                                onChange={(e) => setUserInput({ ...userInput, password: e.target.value })}
                                                required={!editingUserId}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                                    <button type="button" onClick={handleCancelEditUser} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm">Batal</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm">{editingUserId ? "Simpan Perubahan" : "Buat Akun"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ScanHistoryView = () => {
        // Data Dummy Terstruktur untuk Riwayat Scan
        const scanLogs = [
            { id: 1, time: "Hari ini, 10:45:12 WIB", tagCode: "MKI-101-ABCD1234", productName: "Luxury Rose EDP 30ml", brand: "Luxe Scents", location: "Jakarta, ID", ip: "114.122.5.21", scanCount: 1, status: "Original" },
            { id: 2, time: "Hari ini, 10:30:05 WIB", tagCode: "MKI-105-SCRB0001", productName: "Coffee Body Scrub", brand: "PureNaturals", location: "Bandung, ID", ip: "182.253.44.12", scanCount: 1, status: "Original" },
            { id: 3, time: "Hari ini, 09:20:44 WIB", tagCode: "MKI-101-WXYZ9012", productName: "Luxury Rose EDP 30ml", brand: "Luxe Scents", location: "Surabaya, ID", ip: "36.78.22.1", scanCount: 3, status: "Peringatan" },
            { id: 4, time: "Hari ini, 08:15:10 WIB", tagCode: "MKI-101-WXYZ9012", productName: "Luxury Rose EDP 30ml", brand: "Luxe Scents", location: "Surabaya, ID", ip: "36.78.22.1", scanCount: 2, status: "Peringatan" },
            { id: 5, time: "Kemarin, 20:10:00 WIB", tagCode: "MKI-999-FAKE0000", productName: "Unknown / Invalid", brand: "N/A", location: "Tidak Diketahui", ip: "Hidden Proxy", scanCount: 0, status: "Invalid" },
            { id: 6, time: "Kemarin, 14:15:33 WIB", tagCode: "MKI-102-QRST7890", productName: "Acne Fighter Night Cream", brand: "DermaBeauty", location: "Medan, ID", ip: "118.99.20.5", scanCount: 6, status: "Indikasi Palsu" },
            { id: 7, time: "10 Mar 2026, 09:00:12 WIB", tagCode: "MKI-103-SUSP0001", productName: "Gentle Facial Wash 100ml", brand: "Glow & Co", location: "Makassar, ID", ip: "110.137.45.2", scanCount: 1, status: "Suspended" },
        ];

        const processedLogs = scanLogs
            .filter(log => statusFilter === 'Semua Status' || log.status === statusFilter)
            .sort((a, b) => {
                const dir = scanSort.direction === 'asc' ? 1 : -1;
                if (scanSort.key === 'time') return (a.id - b.id) * dir;
                if (scanSort.key === 'tag') return a.tagCode.localeCompare(b.tagCode) * dir;
                if (scanSort.key === 'status') return a.status.localeCompare(b.status) * dir;
                return 0;
            });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Riwayat seluruh aktivitas pemindaian (scan) tag dari end-user (pelanggan). Fitur analitik anti-pemalsuan (anti-counterfeiting) dapat dipantau di sini secara real-time." />

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Activity size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Log Aktivitas Scan</h3>
                            <p className="text-xs text-slate-500">7 Total Pemindaian Tercatat</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter size={14} className="text-slate-400" />
                            </div>
                            <select
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1986E] bg-slate-50 text-slate-700 appearance-none font-medium"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Semua Status">Semua Status</option>
                                <option value="Original">Original (Aman)</option>
                                <option value="Peringatan">Peringatan (Scan &gt; 1)</option>
                                <option value="Indikasi Palsu">Indikasi Palsu</option>
                                <option value="Invalid">Tag Invalid / Tidak Dikenal</option>
                            </select>
                        </div>
                        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('time', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Waktu & Lokasi <SortIcon columnKey="time" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('tag', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Informasi Tag / QR <SortIcon columnKey="tag" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Status Analitik <SortIcon columnKey="status" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {log.time}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {log.location}</p>
                                            <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">IP: {log.ip}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 tracking-wider">
                                                {log.tagCode}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">{log.productName}</p>
                                        {log.brand !== "N/A" && <p className="text-[10px] text-[#C1986E] font-bold uppercase tracking-wide mt-0.5">{log.brand}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            {log.status === 'Original' && (
                                                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                                                    <CheckCircle2 size={12} /> Terverifikasi Asli
                                                </span>
                                            )}
                                            {log.status === 'Peringatan' && (
                                                <span className="bg-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border border-yellow-200 shadow-sm">
                                                    <AlertCircle size={12} /> Peringatan Keamanan
                                                </span>
                                            )}
                                            {(log.status === 'Indikasi Palsu' || log.status === 'Invalid' || log.status === 'Suspended') && (
                                                <span className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border border-red-200 shadow-sm">
                                                    <X size={12} /> {log.status === 'Suspended' ? 'Tag Ditarik (Recall)' : (log.status === 'Invalid' ? 'Tag Tidak Dikenal' : 'Indikasi Dipalsukan')}
                                                </span>
                                            )}

                                            {log.scanCount > 0 && (
                                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                                                    Scan ke-{log.scanCount}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Tooltip text="Lihat Detail Peta & Perangkat" position="left">
                                            <button className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors active:scale-95">
                                                <ArrowRight size={16} />
                                            </button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Muat Data Lebih Lama...</button>
                    </div>
                </div>
            </div>
        );
    };

    const SettingsView = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Pengaturan sistem global. Hanya Super Admin yang dapat mengubah beberapa konfigurasi krusial keamanan." />
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-3xl">
                    <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Lock size={18} className="text-[#C1986E]" /> Konfigurasi Keamanan (Anti-Counterfeit)
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">Batas Maksimal Scan Valid</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Setelah batas dilewati, sistem akan memberi label "Indikasi Palsu/Digandakan".</p>
                            </div>
                            <select defaultValue="5 Kali Scan" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1986E] bg-slate-50">
                                <option value="3 Kali Scan">3 Kali Scan</option>
                                <option value="5 Kali Scan">5 Kali Scan</option>
                                <option value="10 Kali Scan">10 Kali Scan</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">Wajibkan Izin Lokasi Scan (GPS)</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Memaksa browser meminta izin lokasi user saat membuka link validasi.</p>
                            </div>
                            <ToggleSwitch
                                checked={requireGps}
                                onChange={() => setRequireGps(!requireGps)}
                            />
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">Notifikasi Email Peringatan Pemalsuan</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Kirim notifikasi otomatis ke Brand Owner bila ada terdeteksi tag invalid.</p>
                            </div>
                            <ToggleSwitch
                                checked={emailNotif}
                                onChange={() => setEmailNotif(!emailNotif)}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm">Simpan Pengaturan</button>
                    </div>
                </div>
            </div>
        );
    };

    const SidebarItem = ({ icon: Icon, label, id, isSub = false }) => (
        <Tooltip text={isSidebarMinimized ? label : ""} position="right" wrapperClass={`w-full ${isSidebarMinimized ? 'flex justify-center' : ''}`}>
            <button
                onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 py-2.5 rounded-lg transition-all text-sm w-full
          ${isSidebarMinimized ? 'px-0 justify-center' : (isSub ? 'pl-9 pr-3 justify-start' : 'px-3 justify-start')}
          ${activeTab === id
                        ? 'bg-[#C1986E]/10 text-[#C1986E] font-bold border border-[#C1986E]/20'
                        : 'text-slate-600 hover:bg-slate-100 font-medium border border-transparent'
                    }
        `}
            >
                <Icon size={isSub && !isSidebarMinimized ? 16 : 18} className={`${activeTab === id ? 'text-[#C1986E]' : 'text-slate-400'} flex-shrink-0`} />
                {!isSidebarMinimized && <span className="truncate">{label}</span>}
            </button>
        </Tooltip>
    );

    return (
        <div className="h-screen w-full bg-[#F8F9FA] flex text-slate-800 font-sans overflow-hidden">
            {/* Toast Notification */}
            {toast.isOpen && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right-8 fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen ${isSidebarMinimized ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className={`relative p-4 md:p-6 border-b border-slate-100 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C1986E] to-[#8C6D4D] rounded flex items-center justify-center">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        {!isSidebarMinimized && <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#C1986E] to-[#604932]">MKI-Auth</span>}
                    </div>
                    <button className="hidden md:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm z-50 hover:text-[#C1986E]" onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}>
                        {isSidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Tambahkan overflow-x-hidden pada baris di bawah ini */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
                    <div className="pt-2">
                        {!isSidebarMinimized && <p className="px-3 text-xs font-bold uppercase text-slate-400 mb-2">Master Data</p>}
                        <SidebarItem icon={Building2} label="Brand" id="brand" isSub />
                        <SidebarItem icon={ListTree} label="Kategori Produk" id="categories" isSub />
                        <SidebarItem icon={Package} label="SKU Produk" id="product" isSub />
                        <SidebarItem icon={QrCode} label="Generate Tag/QR" id="tags" isSub />
                    </div>
                    <div className="pt-2">
                        <SidebarItem icon={ScanLine} label="Aktivitas Scan" id="scan_history" />
                        <SidebarItem icon={Users} label="Users & Roles" id="users" />
                        <SidebarItem icon={Settings} label="Pengaturan" id="settings" />
                    </div>
                </div>

                {/* User Profile & Logout - Bottom of Sidebar */}
                <div className={`p-4 border-t border-slate-200 flex items-center ${isSidebarMinimized ? 'justify-center cursor-pointer hover:bg-red-50 transition-colors group' : 'justify-between'} bg-slate-50`} onClick={isSidebarMinimized ? handleLogout : undefined}>
                    {isSidebarMinimized ? (
                        <Tooltip text="Logout" position="right">
                            <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        </Tooltip>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C1986E] to-[#A37E58] text-white flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-sm">
                                    AU
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-slate-800 truncate">Admin Utama</span>
                                    <span className="text-[10px] text-slate-500 truncate">Super Admin</span>
                                </div>
                            </div>
                            <Tooltip text="Keluar Sistem" position="top">
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 flex-shrink-0">
                                    <LogOut size={16} />
                                </button>
                            </Tooltip>
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 z-30 relative shadow-sm">
                    <h1 className="text-lg md:text-xl font-bold text-slate-800">{getPageTitle(activeTab)}</h1>
                    <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Search size={16} className="text-slate-400" />
                        <input type="text" placeholder="Cari data..." className="bg-transparent border-none outline-none text-sm w-48 focus:ring-0" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth" id="main-scroll-container">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'dashboard' && DashboardView()}
                        {activeTab === 'brand' && BrandManager()}
                        {activeTab === 'categories' && CategoryManager()}
                        {activeTab === 'product' && ProductManager()}
                        {activeTab === 'product_form' && ProductFormView()}
                        {activeTab === 'tags' && TagGenerator()}
                        {activeTab === 'users' && UserManager()}
                        {activeTab === 'scan_history' && ScanHistoryView()}
                        {activeTab === 'settings' && SettingsView()}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .animate-bar { transform-origin: bottom; animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: scaleY(0); }
        @keyframes barGrow { to { transform: scaleY(1); } }
      `}} />

            {/* Global Confirm Modal */}
            {confirmObj.isOpen && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setConfirmObj({ ...confirmObj, isOpen: false })} // Fungsi tutup saat klik background
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-center"
                        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                    >
                        <div className="p-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{confirmObj.title}</h3>
                            <p className="text-sm text-slate-500 mt-2">{confirmObj.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setConfirmObj({ ...confirmObj, isOpen: false })} className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 text-sm">Batal</button>
                            <button onClick={() => { confirmObj.onConfirm?.(); setConfirmObj({ ...confirmObj, isOpen: false }); }} className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm">Ya, Lanjutkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
