import React from 'react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Download,
    Filter,
    Key,
    Map,
    MapPin,
    Tag,
    X,
} from 'lucide-react';

export default function createScanHistory(context) {
    const {
        handleSortChange,
        PageAlert,
        scanSort,
        setScanSort,
        setStatusFilter,
        SortIcon,
        statusFilter,
        Tooltip,
    } = context;
    const ScanHistory = () => {
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

    return ScanHistory;
}
