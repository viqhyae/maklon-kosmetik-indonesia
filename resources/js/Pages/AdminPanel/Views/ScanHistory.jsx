import React from 'react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    Eye,
    Filter,
    Info,
    MapPin,
    X,
} from 'lucide-react';

export default function createScanHistory(context) {
    const {
        handleSortChange,
        isRefreshingScanLogs,
        PageAlert,
        scanLogs,
        scanSort,
        selectedScanLogDetail,
        setScanSort,
        setSelectedScanLogDetail,
        setStatusFilter,
        SortIcon,
        statusFilter,
    } = context;

    const ScanHistory = () => {
        const parseCoordinateNumber = (value) => {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : null;
            }

            const rawValue = String(value ?? '').trim();
            if (rawValue === '') return null;

            // Keep only coordinate-safe characters to handle values like "Lat: -6,2012".
            let normalized = rawValue.replace(/[^\d.,+-]/g, '');
            if (normalized === '') return null;

            if (normalized.includes(',') && normalized.includes('.')) {
                const lastCommaIdx = normalized.lastIndexOf(',');
                const lastDotIdx = normalized.lastIndexOf('.');
                normalized = lastCommaIdx > lastDotIdx
                    ? normalized.replace(/\./g, '').replace(',', '.')
                    : normalized.replace(/,/g, '');
            } else if (normalized.includes(',') && !normalized.includes('.')) {
                normalized = normalized.replace(',', '.');
            }

            const parsed = Number.parseFloat(normalized);
            return Number.isFinite(parsed) ? parsed : null;
        };

        const normalizeCoordinate = (value, min, max) => {
            const parsed = parseCoordinateNumber(value);
            if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
                return null;
            }

            return Number(parsed.toFixed(6));
        };

        const normalizeCoordinatePair = (firstValue, secondValue) => {
            const directLat = normalizeCoordinate(firstValue, -90, 90);
            const directLng = normalizeCoordinate(secondValue, -180, 180);
            if (directLat !== null && directLng !== null) {
                return { lat: directLat, lng: directLng };
            }

            const swappedLat = normalizeCoordinate(secondValue, -90, 90);
            const swappedLng = normalizeCoordinate(firstValue, -180, 180);
            if (swappedLat !== null && swappedLng !== null) {
                return { lat: swappedLat, lng: swappedLng };
            }

            return null;
        };

        const extractCoordinatesFromLocation = (locationValue) => {
            const locationText = String(locationValue || '');
            if (!locationText) return null;

            const latByLabelMatch = locationText.match(/(?:lat|latitude)[^\d+-]*([+-]?\d+(?:[.,]\d+)?)/i);
            const lngByLabelMatch = locationText.match(/(?:lng|long|longitude)[^\d+-]*([+-]?\d+(?:[.,]\d+)?)/i);
            if (latByLabelMatch && lngByLabelMatch) {
                const byLabelPair = normalizeCoordinatePair(latByLabelMatch[1], lngByLabelMatch[1]);
                if (byLabelPair) return byLabelPair;
            }

            const separatedPair = locationText.match(/([+-]?\d+(?:[.,]\d+)?)\s*[,;/]\s*([+-]?\d+(?:[.,]\d+)?)/);
            if (separatedPair) {
                const bySeparatorPair = normalizeCoordinatePair(separatedPair[1], separatedPair[2]);
                if (bySeparatorPair) return bySeparatorPair;
            }

            const spacedPair = locationText.match(/([+-]?\d+(?:[.,]\d+)?)\s+([+-]?\d+(?:[.,]\d+)?)/);
            if (spacedPair) {
                return normalizeCoordinatePair(spacedPair[1], spacedPair[2]);
            }

            return null;
        };

        const getLogCoordinates = (log) => {
            if (!log) return null;

            const byDirectFieldPair = normalizeCoordinatePair(log.latitude, log.longitude);
            if (byDirectFieldPair) {
                return byDirectFieldPair;
            }

            return extractCoordinatesFromLocation(log.location);
        };

        const processedLogs = scanLogs
            .filter((log) => statusFilter === 'Semua Status' || log.status === statusFilter)
            .sort((a, b) => {
                const dir = scanSort.direction === 'asc' ? 1 : -1;

                if (scanSort.key === 'time') {
                    const timeA = new Date(a.scannedAt || 0).getTime();
                    const timeB = new Date(b.scannedAt || 0).getTime();
                    return (timeA - timeB) * dir;
                }

                if (scanSort.key === 'tag') {
                    return String(a.tagCode || '').localeCompare(String(b.tagCode || '')) * dir;
                }

                if (scanSort.key === 'status') {
                    return String(a.status || '').localeCompare(String(b.status || '')) * dir;
                }

                return (Number(a.id || 0) - Number(b.id || 0)) * dir;
            });
        const previewLog = selectedScanLogDetail;
        const previewCoordinates = getLogCoordinates(previewLog);
        const previewCoordinateText = previewCoordinates
            ? `(${previewCoordinates.lat.toFixed(6)}, ${previewCoordinates.lng.toFixed(6)})`
            : '-';
        const previewMapEmbedUrl = previewCoordinates
            ? `https://www.google.com/maps?q=${previewCoordinates.lat},${previewCoordinates.lng}&z=15&output=embed`
            : null;
        const previewMapOpenUrl = previewCoordinates
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${previewCoordinates.lat},${previewCoordinates.lng}`)}`
            : null;

        const handleExportCsv = () => {
            const csvHeader = ['Waktu', 'Kode', 'Produk', 'Brand', 'Lokasi', 'Latitude', 'Longitude', 'IP', 'Scan Ke', 'Status'];
            const csvRows = processedLogs.map((log) => {
                const coordinates = getLogCoordinates(log);
                const latitude = coordinates ? coordinates.lat.toFixed(6) : '-';
                const longitude = coordinates ? coordinates.lng.toFixed(6) : '-';

                return [
                log.time || '-',
                log.tagCode || '-',
                log.productName || '-',
                log.brand || '-',
                log.location || '-',
                latitude,
                longitude,
                log.ip || '-',
                String(log.scanCount ?? 0),
                log.status || '-',
                ];
            });

            const escapeCsvValue = (value) => {
                const text = String(value ?? '');
                return `"${text.replaceAll('"', '""')}"`;
            };

            const csvContent = [csvHeader, ...csvRows]
                .map((row) => row.map(escapeCsvValue).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const wibDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(new Date());

            link.href = url;
            link.setAttribute('download', `scan-activities-${wibDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        };

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Riwayat aktivitas scan dari halaman verifikasi publik. Data ini tercatat otomatis setiap kali pengguna mengecek kode." />

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Activity size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Log Aktivitas Scan</h3>
                            <p className="text-xs text-slate-500">
                                {new Intl.NumberFormat('id-ID').format(scanLogs.length)} Total Pemindaian Tercatat
                                {isRefreshingScanLogs ? ' (sinkronisasi...)' : ''}
                            </p>
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
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="Semua Status">Semua Status</option>
                                <option value="Original">Terverifikasi Asli</option>
                                <option value="Peringatan">Peringatan Keamanan</option>
                                <option value="Suspended">Tag Ditarik (Recall)</option>
                                <option value="Invalid">Tag Tidak Dikenal</option>
                            </select>
                        </div>
                        <button
                            onClick={handleExportCsv}
                            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
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
                            {processedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-400 text-sm">
                                        Belum ada aktivitas scan yang tercatat.
                                    </td>
                                </tr>
                            ) : (
                                processedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {log.time || '-'}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {log.location || '-'}</p>
                                                <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">IP: {log.ip || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 tracking-wider">
                                                    {log.tagCode || '-'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800">{log.productName || 'Unknown / Invalid'}</p>
                                            {log.brand !== 'N/A' && <p className="text-[10px] text-[#C1986E] font-bold uppercase tracking-wide mt-0.5">{log.brand}</p>}
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
                                                        <X size={12} /> {log.status === 'Suspended' ? 'Tag Ditarik (Recall)' : (log.status === 'Invalid' ? 'Tag Tidak Dikenal' : 'Indikasi Dipalsukan (Data Lama)')}
                                                    </span>
                                                )}

                                                {Number(log.scanCount || 0) > 0 && (
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                                                        Scan ke-{log.scanCount}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setSelectedScanLogDetail(log);
                                                }}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                            >
                                                <Eye size={12} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {previewLog && (
                    <div
                        className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                setSelectedScanLogDetail(null);
                            }
                        }}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Info size={18} className="text-[#C1986E]" /> Detail Aktivitas Scan
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedScanLogDetail(null)}
                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Waktu Scan</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.time || '-'}</p>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tag / QR</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1 break-all">{previewLog.tagCode || '-'}</p>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Produk</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.productName || 'Unknown / Invalid'}</p>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Brand</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.brand || 'N/A'}</p>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IP Address</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.ip || '-'}</p>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scan Ke</p>
                                                <p className="text-sm font-semibold text-slate-800 mt-1">{Number(previewLog.scanCount || 0)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Status Analitik</p>
                                            {previewLog.status === 'Original' && (
                                                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                                                    <CheckCircle2 size={12} /> Terverifikasi Asli
                                                </span>
                                            )}
                                            {previewLog.status === 'Peringatan' && (
                                                <span className="bg-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-yellow-200 shadow-sm">
                                                    <AlertCircle size={12} /> Peringatan Keamanan
                                                </span>
                                            )}
                                            {(previewLog.status === 'Indikasi Palsu' || previewLog.status === 'Invalid' || previewLog.status === 'Suspended') && (
                                                <span className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-red-200 shadow-sm">
                                                    <X size={12} /> {previewLog.status === 'Suspended' ? 'Tag Ditarik (Recall)' : (previewLog.status === 'Invalid' ? 'Tag Tidak Dikenal' : 'Indikasi Dipalsukan (Data Lama)')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi</p>
                                            <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.location || '-'}</p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Format untuk map: <span className="font-mono text-[11px]">{previewCoordinateText}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="h-[320px] md:h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            {previewMapEmbedUrl ? (
                                                <iframe
                                                    src={previewMapEmbedUrl}
                                                    title={`Google Maps - Scan ${previewLog.id}`}
                                                    className="w-full h-full"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center p-6 text-center text-slate-500 text-sm">
                                                    Koordinat belum tersedia, sehingga preview Google Maps tidak dapat ditampilkan.
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <p className="text-xs text-slate-500">
                                                Koordinat lokasi: <span className="font-mono text-[11px] text-slate-700">{previewCoordinateText}</span>
                                            </p>
                                            {previewMapOpenUrl ? (
                                                <a
                                                    href={previewMapOpenUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors w-fit"
                                                >
                                                    <ExternalLink size={13} /> Buka di Google Maps
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">Tidak bisa membuka Google Maps tanpa koordinat.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end sticky bottom-0 z-10">
                                <button
                                    type="button"
                                    onClick={() => setSelectedScanLogDetail(null)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm"
                                >
                                    Tutup Detail
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return ScanHistory;
}
