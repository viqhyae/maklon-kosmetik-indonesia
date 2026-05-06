import React from 'react';
import { createPortal } from 'react-dom';
import {
    Activity,
    AlertCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CheckCircle2,
    Download,
    ExternalLink,
    Eye,
    Info,
    X,
} from 'lucide-react';

const SCAN_HISTORY_PAGE_SIZE = 10;
const SCAN_DETAIL_VISIBLE_PAGE_LIMIT = 3;

export default function createScanHistory(context) {
    const resolveContext = typeof context === 'function' ? context : () => context;

    const ScanHistory = () => {
        const {
            globalSearch,
            handleSortChange,
            PageAlert,
            scanLogs,
            scanSort,
            selectedScanLogDetail,
            setScanSort,
            setSelectedScanLogDetail,
            SortIcon,
        } = resolveContext();
        const [currentPage, setCurrentPage] = React.useState(1);
        const [goToScanPageInput, setGoToScanPageInput] = React.useState('');

        const renderModalInBody = React.useCallback((node) => {
            if (typeof document === 'undefined') return null;
            return createPortal(node, document.body);
        }, []);

        const parseCoordinateNumber = (value) => {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : null;
            }

            const rawValue = String(value ?? '').trim();
            if (rawValue === '') return null;

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

        const normalizeText = (value) => String(value ?? '').trim();
        const getLogTimestamp = (log) => {
            const parsed = new Date(log?.scannedAt || 0).getTime();
            if (Number.isFinite(parsed)) return parsed;

            return Number(log?.id || 0);
        };
        const getScanSequence = (log, fallbackIndex) => {
            const sequence = Number(log?.scanCount || 0);
            return sequence > 0 ? sequence : fallbackIndex + 1;
        };
        const isMeaningfulProductName = (value) => {
            const text = normalizeText(value);
            return text !== '' && text !== '-' && text.toLowerCase() !== 'unknown / invalid';
        };
        const isMeaningfulBrandName = (value) => {
            const text = normalizeText(value);
            return text !== '' && text !== '-' && text.toLowerCase() !== 'n/a';
        };
        const sortLogsByScanSequence = (left, right) => {
            const leftSequence = Number(left?.scanCount || 0);
            const rightSequence = Number(right?.scanCount || 0);
            if (leftSequence !== rightSequence) return leftSequence - rightSequence;

            const timeDiff = getLogTimestamp(left) - getLogTimestamp(right);
            if (timeDiff !== 0) return timeDiff;

            return Number(left?.id || 0) - Number(right?.id || 0);
        };
        const sortLogsNewestFirst = (left, right) => {
            const timeDiff = getLogTimestamp(right) - getLogTimestamp(left);
            if (timeDiff !== 0) return timeDiff;

            return Number(right?.id || 0) - Number(left?.id || 0);
        };

        const searchQuery = String(globalSearch || '').toLowerCase().trim();
        const groupedScanLogs = React.useMemo(() => {
            const groupsByCode = new Map();

            (scanLogs || []).forEach((log) => {
                const tagCode = normalizeText(log?.tagCode) || 'Tanpa Kode';
                const groupKey = tagCode.toUpperCase();

                if (!groupsByCode.has(groupKey)) {
                    groupsByCode.set(groupKey, {
                        key: groupKey,
                        tagCode,
                        logs: [],
                    });
                }

                groupsByCode.get(groupKey).logs.push(log);
            });

            return Array.from(groupsByCode.values()).map((group) => {
                const detailLogs = [...group.logs].sort(sortLogsByScanSequence);
                const latestLog = [...group.logs].sort(sortLogsNewestFirst)[0] || detailLogs[detailLogs.length - 1] || {};
                const productLog = detailLogs.find((log) => isMeaningfulProductName(log.productName));
                const brandLog = detailLogs.find((log) => isMeaningfulBrandName(log.brand));
                const productName = productLog?.productName || latestLog?.productName || 'Unknown / Invalid';
                const brandName = brandLog?.brand || latestLog?.brand || 'N/A';
                const scanCount = Math.max(
                    detailLogs.length,
                    detailLogs.reduce((maxValue, log) => Math.max(maxValue, Number(log?.scanCount || 0)), 0)
                );
                const searchableText = [
                    group.tagCode,
                    productName,
                    brandName,
                    String(scanCount),
                    ...detailLogs.flatMap((log) => [
                        log.time,
                        log.tagCode,
                        log.productName,
                        log.brand,
                        log.location,
                        log.ip,
                        log.status,
                        log.tagStatus,
                        log.suspendReason,
                        log.userAgent,
                        String(log.scanCount ?? ''),
                    ]),
                ].map((value) => normalizeText(value).toLowerCase()).join(' ');

                return {
                    ...group,
                    detailLogs,
                    latestLog,
                    productName,
                    brandName,
                    scanCount,
                    status: normalizeText(latestLog?.status) || 'Invalid',
                    latestTimestamp: getLogTimestamp(latestLog),
                    searchableText,
                };
            });
        }, [scanLogs]);

        const processedGroups = React.useMemo(() => (
            groupedScanLogs
                .filter((group) => !searchQuery || group.searchableText.includes(searchQuery))
                .sort((a, b) => {
                    const dir = scanSort.direction === 'asc' ? 1 : -1;

                    if (scanSort.key === 'tag') {
                        return a.tagCode.localeCompare(b.tagCode) * dir;
                    }

                    if (scanSort.key === 'product') {
                        const productCompare = a.productName.localeCompare(b.productName) * dir;
                        if (productCompare !== 0) return productCompare;
                        return a.brandName.localeCompare(b.brandName) * dir;
                    }

                    if (scanSort.key === 'scanCount') {
                        return (a.scanCount - b.scanCount) * dir;
                    }

                    if (scanSort.key === 'status') {
                        return a.status.localeCompare(b.status) * dir;
                    }

                    return (a.latestTimestamp - b.latestTimestamp) * dir;
                })
        ), [groupedScanLogs, scanSort.direction, scanSort.key, searchQuery]);

        const totalPages = Math.max(1, Math.ceil(processedGroups.length / SCAN_HISTORY_PAGE_SIZE));
        const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
        const pageStartIndex = processedGroups.length === 0
            ? 0
            : ((safeCurrentPage - 1) * SCAN_HISTORY_PAGE_SIZE) + 1;
        const pageEndIndex = Math.min(safeCurrentPage * SCAN_HISTORY_PAGE_SIZE, processedGroups.length);
        const paginatedGroups = processedGroups.slice(pageStartIndex > 0 ? pageStartIndex - 1 : 0, pageEndIndex);
        const visiblePageNumbers = React.useMemo(() => {
            if (totalPages <= 5) {
                return Array.from({ length: totalPages }, (_, index) => index + 1);
            }

            const startPage = Math.max(1, Math.min(safeCurrentPage - 2, totalPages - 4));
            return Array.from({ length: 5 }, (_, index) => startPage + index);
        }, [safeCurrentPage, totalPages]);
        const selectedScanGroup = React.useMemo(() => {
            const selectedCode = normalizeText(selectedScanLogDetail?.tagCode);
            if (!selectedCode) return null;

            return groupedScanLogs.find((group) => group.key === selectedCode.toUpperCase()) || null;
        }, [groupedScanLogs, selectedScanLogDetail?.tagCode]);

        const detailLogs = selectedScanGroup?.detailLogs || [];
        const selectedDetailIndex = Math.max(
            0,
            detailLogs.findIndex((log) => Number(log?.id || 0) === Number(selectedScanLogDetail?.id || 0))
        );
        const previewLog = detailLogs[selectedDetailIndex] || selectedScanLogDetail;
        const selectedDetailPage = selectedDetailIndex + 1;
        const totalDetailPages = Math.max(1, detailLogs.length);
        const detailPaginationItems = React.useMemo(() => {
            if (totalDetailPages <= SCAN_DETAIL_VISIBLE_PAGE_LIMIT + 1) {
                return Array.from({ length: totalDetailPages }, (_, index) => ({
                    type: 'page',
                    pageNumber: index + 1,
                }));
            }

            const lastWindowStart = totalDetailPages - SCAN_DETAIL_VISIBLE_PAGE_LIMIT + 1;
            let startPage = selectedDetailPage <= SCAN_DETAIL_VISIBLE_PAGE_LIMIT
                ? 1
                : selectedDetailPage >= lastWindowStart
                    ? lastWindowStart
                    : selectedDetailPage - 1;
            startPage = Math.max(1, Math.min(startPage, lastWindowStart));

            const endPage = Math.min(totalDetailPages, startPage + SCAN_DETAIL_VISIBLE_PAGE_LIMIT - 1);
            const items = [];

            if (startPage > 1) {
                items.push({ type: 'page', pageNumber: 1 });
                if (startPage > 2) {
                    items.push({ type: 'ellipsis', id: 'start' });
                }
            }

            for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
                items.push({ type: 'page', pageNumber });
            }

            if (endPage < totalDetailPages) {
                if (endPage < totalDetailPages - 1) {
                    items.push({ type: 'ellipsis', id: 'end' });
                }
                items.push({ type: 'page', pageNumber: totalDetailPages });
            }

            return items;
        }, [selectedDetailPage, totalDetailPages]);

        React.useEffect(() => {
            setCurrentPage(1);
        }, [scanSort.direction, scanSort.key, searchQuery]);

        React.useEffect(() => {
            if (currentPage !== safeCurrentPage) {
                setCurrentPage(safeCurrentPage);
            }
        }, [currentPage, safeCurrentPage]);

        React.useEffect(() => {
            if (!selectedScanLogDetail) return;

            if (!selectedScanGroup) {
                setSelectedScanLogDetail(null);
                return;
            }

            const selectedId = Number(selectedScanLogDetail?.id || 0);
            const selectedStillExists = selectedScanGroup.detailLogs.some((log) => Number(log?.id || 0) === selectedId);
            if (!selectedStillExists) {
                setSelectedScanLogDetail(selectedScanGroup.detailLogs[selectedScanGroup.detailLogs.length - 1] || null);
            }
        }, [selectedScanGroup, selectedScanLogDetail, setSelectedScanLogDetail]);

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

        const openScanGroupDetail = (group) => {
            setGoToScanPageInput('');
            setSelectedScanLogDetail(group.detailLogs[group.detailLogs.length - 1] || null);
        };

        const closeScanGroupDetail = () => {
            setGoToScanPageInput('');
            setSelectedScanLogDetail(null);
        };

        const selectDetailPage = (pageNumber) => {
            const nextPage = Math.min(Math.max(Number(pageNumber) || 1, 1), totalDetailPages);
            const nextLog = detailLogs[nextPage - 1];
            if (nextLog) {
                setSelectedScanLogDetail(nextLog);
                setGoToScanPageInput('');
            }
        };

        const adjustGoToScanPageInput = (step) => {
            setGoToScanPageInput((currentValue) => {
                const parsedValue = Number(currentValue);
                const baseValue = Number.isFinite(parsedValue) && parsedValue > 0
                    ? parsedValue
                    : selectedDetailPage;
                const nextValue = Math.min(Math.max(Math.trunc(baseValue) + step, 1), totalDetailPages);

                return String(nextValue);
            });
        };

        const handleGoToScanPage = (event) => {
            event.preventDefault();
            selectDetailPage(goToScanPageInput);
        };

        const handleExportCsv = () => {
            const csvHeader = ['Waktu', 'Kode', 'Produk', 'Brand', 'Lokasi', 'Latitude', 'Longitude', 'IP', 'Scan Ke', 'Status', 'Alasan Suspend'];
            const exportLogs = processedGroups.flatMap((group) => group.detailLogs);
            const csvRows = exportLogs.map((log) => {
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
                    log.suspendReason || '-',
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

        const renderStatusBadge = (log) => (
            <>
                {log.status === 'Original' && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                        <CheckCircle2 size={12} /> Terverifikasi Asli
                    </span>
                )}
                {log.status === 'Peringatan' && (
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-yellow-200 shadow-sm">
                        <AlertCircle size={12} /> Peringatan Keamanan
                    </span>
                )}
                {(log.status === 'Indikasi Palsu' || log.status === 'Invalid' || log.status === 'Suspended') && (
                    <span className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 border border-red-200 shadow-sm">
                        <X size={12} /> {log.status === 'Suspended' ? 'Tag Ditarik (Recall)' : (log.status === 'Invalid' ? 'Tag Tidak Dikenal' : 'Indikasi Dipalsukan (Data Lama)')}
                    </span>
                )}
            </>
        );

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Riwayat aktivitas scan dari halaman verifikasi publik. Data digrup berdasarkan Tag/QR Code, lalu setiap detail dapat dibuka per urutan scan." />

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Activity size={20} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Log Aktivitas Scan</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            disabled={processedGroups.length === 0}
                            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full min-w-[1040px] text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('tag', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Tag/QR Code <SortIcon columnKey="tag" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('product', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Nama Produk & Brand <SortIcon columnKey="product" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('scanCount', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Jumlah Scan <SortIcon columnKey="scanCount" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('time', scanSort, setScanSort)}>
                                    <div className="flex items-center gap-2">Terakhir Scan <SortIcon columnKey="time" sortConfig={scanSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedGroups.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-400 text-sm">
                                        {searchQuery
                                            ? 'Tidak ada aktivitas scan yang sesuai dengan filter.'
                                            : 'Belum ada aktivitas scan yang tercatat.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedGroups.map((group) => (
                                    <tr
                                        key={group.key}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 align-middle">
                                            <span className="font-mono text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 border border-slate-200 tracking-wider break-all">
                                                {group.tagCode || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <p className="text-sm font-bold text-slate-800 whitespace-normal">{group.productName || 'Unknown / Invalid'}</p>
                                            <p className="text-[11px] text-[#C1986E] font-bold uppercase tracking-wide mt-1">
                                                {group.brandName || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <p className="text-base font-semibold text-slate-500">
                                                <span className="font-bold text-slate-800 align-middle">
                                                {new Intl.NumberFormat('id-ID').format(group.scanCount)}
                                                </span>
                                                <span className="ml-2 align-middle">Aktivitas Scan</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <p className="text-sm font-semibold text-slate-700">{group.latestLog?.time || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center align-middle">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openScanGroupDetail(group);
                                                }}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
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

                {processedGroups.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{pageStartIndex}</span>
                            {' - '}
                            <span className="font-semibold text-slate-700">{pageEndIndex}</span>
                            {' '}dari <span className="font-semibold text-slate-700">{processedGroups.length}</span>.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={safeCurrentPage <= 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                            {visiblePageNumbers.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-colors ${
                                        pageNumber === safeCurrentPage
                                            ? 'border-[#C1986E] bg-[#C1986E] text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                disabled={safeCurrentPage >= totalPages}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Berikutnya <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {selectedScanGroup && previewLog && renderModalInBody(
                    <div
                        className="admin-modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                closeScanGroupDetail();
                            }
                        }}
                    >
                        <div
                            className="admin-modal-panel bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="admin-modal-header bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Info size={18} className="text-[#C1986E]" /> Detail Aktivitas Scan
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeScanGroupDetail}
                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="admin-modal-body p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:items-stretch">
                                    <div className="space-y-4 xl:h-full xl:flex xl:flex-col">
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
                                                <p className="text-sm font-semibold text-slate-800 mt-1">
                                                    {getScanSequence(previewLog, selectedDetailIndex)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Status Analitik</p>
                                            {renderStatusBadge(previewLog)}
                                        </div>

                                        {previewLog.status === 'Suspended' && (
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alasan Suspend</p>
                                                <p className="text-sm font-semibold text-slate-700 mt-1 whitespace-pre-wrap break-words">
                                                    {previewLog.suspendReason || '-'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lokasi</p>
                                            <p className="text-sm font-semibold text-slate-800 mt-1">{previewLog.location || '-'}</p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Format untuk map: <span className="font-mono text-[11px]">{previewCoordinateText}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 xl:h-full xl:flex xl:flex-col">
                                        <div className="h-[320px] md:h-[420px] xl:h-auto xl:flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
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

                            <div className="admin-modal-footer bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sticky bottom-0 z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => selectDetailPage(selectedDetailPage - 1)}
                                            disabled={selectedDetailPage <= 1}
                                            className="h-8 min-w-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {'<'}
                                        </button>
                                        {detailPaginationItems.map((item) => (
                                            item.type === 'ellipsis' ? (
                                                <span key={item.id} className="px-1 text-sm font-bold text-slate-400">...</span>
                                            ) : (
                                                <button
                                                    key={item.pageNumber}
                                                    type="button"
                                                    onClick={() => selectDetailPage(item.pageNumber)}
                                                    className={`h-8 min-w-8 rounded-lg border px-2 text-sm font-bold transition-colors ${
                                                        item.pageNumber === selectedDetailPage
                                                            ? 'border-[#C1986E] bg-[#C1986E] text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {item.pageNumber}
                                                </button>
                                            )
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => selectDetailPage(selectedDetailPage + 1)}
                                            disabled={selectedDetailPage >= totalDetailPages}
                                            className="h-8 min-w-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {'>'}
                                        </button>
                                    </div>

                                    <form onSubmit={handleGoToScanPage} className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Aktivitas Scan ke -</span>
                                        <div className="flex items-stretch">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                value={goToScanPageInput}
                                                onChange={(event) => {
                                                    const sanitizedValue = event.target.value.replace(/\D/g, '').slice(0, 4);
                                                    setGoToScanPageInput(sanitizedValue);
                                                }}
                                                placeholder={String(selectedDetailPage)}
                                                className="admin-theme-control h-8 w-16 rounded-l-lg border border-slate-200 px-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C1986E]"
                                            />
                                            <div className="flex flex-col border-y border-r border-slate-200 rounded-r-lg overflow-hidden bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() => adjustGoToScanPageInput(1)}
                                                    className="h-4 w-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                                                    aria-label="Tambah angka halaman"
                                                >
                                                    <ChevronUp size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => adjustGoToScanPageInput(-1)}
                                                    className="h-4 w-6 flex items-center justify-center border-t border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                                                    aria-label="Kurangi angka halaman"
                                                >
                                                    <ChevronDown size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="h-8 px-3 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                                        >
                                            Go
                                        </button>
                                    </form>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeScanGroupDetail}
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
