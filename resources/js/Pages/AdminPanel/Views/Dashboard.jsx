import React from 'react';
import {
    Activity,
    Building2,
    MapPin,
    Package,
    ScanLine,
    Tag,
    TrendingUp,
} from 'lucide-react';

const WEEK_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const LEAFLET_ALLOWED_STATUSES = new Set(['Original', 'Suspended', 'Peringatan']);

const getStartOfWeek = (date) => {
    const weekDate = new Date(date);
    weekDate.setHours(0, 0, 0, 0);
    const mondayIndex = (weekDate.getDay() + 6) % 7;
    weekDate.setDate(weekDate.getDate() - mondayIndex);
    return weekDate;
};

const toSafeNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const toScanDate = (scanLog) => {
    const isoDate = String(scanLog?.scannedAt || '').trim();
    if (isoDate === '') return null;
    const parsedDate = new Date(isoDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getNiceAxisMax = (rawMax) => {
    const safeMax = Math.max(1, Number(rawMax || 0));
    const paddedValue = Math.max(1, Math.ceil(safeMax * 1.15));
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedValue)));
    const normalized = paddedValue / magnitude;

    if (normalized <= 1) return 1 * magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
};

const formatCityFromLocation = (locationValue) => {
    const safeLocation = String(locationValue || '').trim();
    if (!safeLocation || safeLocation.toLowerCase() === 'tidak diketahui') {
        return '';
    }

    const firstChunk = safeLocation.split(',')[0]?.trim() || '';
    return firstChunk
        .replace(/^kota\s+/i, '')
        .replace(/^kabupaten\s+/i, '')
        .trim();
};

export default function createDashboard(context) {
    const {
        brands,
        LeafletMap,
        PageAlert,
        products,
        scanLogs,
        scanActivitiesCount,
        StatCard,
        Tooltip,
        totalGeneratedTagCount,
    } = context;
    const Dashboard = () => {
        const {
            currentWeekSeries,
            axisTicks,
            axisMax,
            trendPercent,
            trendDirection,
        } = React.useMemo(() => {
            const now = new Date();
            const currentWeekStart = getStartOfWeek(now);
            const nextWeekStart = new Date(currentWeekStart);
            nextWeekStart.setDate(nextWeekStart.getDate() + 7);
            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(previousWeekStart.getDate() - 7);

            const weeklySeries = WEEK_DAYS.map((dayLabel) => ({
                day: dayLabel,
                count: 0,
            }));
            let safeCurrentWeekTotal = 0;
            let safePreviousWeekTotal = 0;

            (scanLogs || []).forEach((scanLog) => {
                const scanDate = toScanDate(scanLog);
                if (!scanDate) return;

                if (scanDate >= currentWeekStart && scanDate < nextWeekStart) {
                    const weekIndex = (scanDate.getDay() + 6) % 7;
                    weeklySeries[weekIndex].count += 1;
                    safeCurrentWeekTotal += 1;
                    return;
                }

                if (scanDate >= previousWeekStart && scanDate < currentWeekStart) {
                    safePreviousWeekTotal += 1;
                }
            });

            const maxDailyCount = Math.max(...weeklySeries.map((item) => item.count), 1);
            const safeAxisMax = getNiceAxisMax(maxDailyCount);
            const safeAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(safeAxisMax * ratio));

            const trendDelta = safeCurrentWeekTotal - safePreviousWeekTotal;
            const safeTrendPercent = safePreviousWeekTotal > 0
                ? (trendDelta / safePreviousWeekTotal) * 100
                : (safeCurrentWeekTotal > 0 ? 100 : 0);
            const safeTrendDirection = trendDelta >= 0 ? 'up' : 'down';

            return {
                currentWeekSeries: weeklySeries,
                axisTicks: safeAxisTicks,
                axisMax: safeAxisMax,
                trendPercent: Math.abs(safeTrendPercent),
                trendDirection: safeTrendDirection,
            };
        }, [scanLogs]);

        const distributionCityPoints = React.useMemo(() => {
            const cityMap = new Map();

            (scanLogs || []).forEach((scanLog) => {
                const normalizedStatus = String(scanLog?.status || '').trim();
                if (!LEAFLET_ALLOWED_STATUSES.has(normalizedStatus)) return;

                const latitude = toSafeNumber(scanLog?.latitude);
                const longitude = toSafeNumber(scanLog?.longitude);
                if (latitude === null || longitude === null) return;

                const cityName = formatCityFromLocation(scanLog?.location);
                if (!cityName) return;

                const existing = cityMap.get(cityName) || {
                    city: cityName,
                    latitudeSum: 0,
                    longitudeSum: 0,
                    count: 0,
                    originalCount: 0,
                    suspendedCount: 0,
                    warningCount: 0,
                };

                existing.latitudeSum += latitude;
                existing.longitudeSum += longitude;
                existing.count += 1;
                if (normalizedStatus === 'Original') existing.originalCount += 1;
                if (normalizedStatus === 'Suspended') existing.suspendedCount += 1;
                if (normalizedStatus === 'Peringatan') existing.warningCount += 1;

                cityMap.set(cityName, existing);
            });

            return Array.from(cityMap.values())
                .map((item) => ({
                    city: item.city,
                    latitude: item.latitudeSum / item.count,
                    longitude: item.longitudeSum / item.count,
                    scans: item.count,
                    originalCount: item.originalCount,
                    suspendedCount: item.suspendedCount,
                    warningCount: item.warningCount,
                    severity: item.suspendedCount > 0 ? 'recall' : (item.warningCount > 0 ? 'warning' : 'original'),
                }))
                .sort((left, right) => right.scans - left.scans);
        }, [scanLogs]);

        const isTrendUp = trendDirection === 'up';
        const trendPillClassName = isTrendUp
            ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
            : 'text-red-600 bg-red-50 border-red-100';
        const trendText = `${isTrendUp ? '+' : '-'}${trendPercent.toFixed(1)}%`;

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Selamat datang di Dashboard Admin. Pantau ringkasan operasional, total master data, dan statistik aktivitas scan tag di sini." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Brand" value={brands.length} icon={Building2} color="bg-[#C1986E]" />
                    <StatCard title="Total SKU Produk" value={products.length} icon={Package} color="bg-emerald-500" />
                    <StatCard title="Tag QR Aktif" value={new Intl.NumberFormat('id-ID').format(totalGeneratedTagCount)} icon={Tag} color="bg-purple-500" />
                    <StatCard title="Total Aktivitas Scan" value={new Intl.NumberFormat('id-ID').format(Number(scanActivitiesCount || 0))} icon={ScanLine} color="bg-blue-500" />
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Activity size={18} className="text-[#C1986E]" /> Grafik Aktivitas Scan
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Reset Tiap Senin</p>
                            </div>
                            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium border ${trendPillClassName}`}>
                                <TrendingUp size={16} /> {trendText}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col mt-6">
                            <div className="relative h-48 w-full flex">
                                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium pointer-events-none z-0">
                                    {axisTicks.map((tickValue, tickIndex) => (
                                        <div key={`tick-${tickIndex}`} className="flex items-center gap-3 w-full">
                                            <span className="w-10 text-right">{new Intl.NumberFormat('id-ID').format(tickValue)}</span>
                                            <div className={`flex-1 border-t ${tickValue === 0 ? 'border-slate-200' : 'border-slate-100 border-dashed'}`}></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1 flex items-end gap-3 sm:gap-6 pl-12 z-10 pb-[1px]">
                                    {currentWeekSeries.map((item, idx) => (
                                        <div key={idx} className="flex-1 h-full flex flex-col justify-end group cursor-pointer relative">
                                            <Tooltip text={`${new Intl.NumberFormat('id-ID').format(item.count)} aktivitas`} position="top" wrapperClass="w-full h-full flex items-end justify-center">
                                                <div className="absolute inset-0 w-full h-full bg-slate-50/30 rounded-t-sm transition-colors group-hover:bg-slate-100/50 pointer-events-none"></div>
                                                <div
                                                    className="w-full bg-gradient-to-t from-[#C1986E] to-[#e6bd95] rounded-t-sm transition-[height,opacity] duration-500 group-hover:opacity-80"
                                                    style={{ height: item.count > 0 ? `${Math.max((item.count / axisMax) * 100, 1)}%` : '0%' }}
                                                ></div>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-6 pl-12 mt-3">
                                {WEEK_DAYS.map((day, idx) => (
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
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full cursor-help"></div>
                            </Tooltip>
                        </div>
                        <div className="w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden border border-slate-200 z-0 shadow-inner">
                            <LeafletMap locationPoints={distributionCityPoints} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return Dashboard;
}
