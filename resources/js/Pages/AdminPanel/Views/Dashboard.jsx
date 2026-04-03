import React from 'react';
import {
    Activity,
    Building2,
    Key,
    Map,
    MapPin,
    Package,
    ScanLine,
    Tag,
    TrendingUp,
} from 'lucide-react';

export default function createDashboard(context) {
    const {
        brands,
        LeafletMap,
        PageAlert,
        products,
        StatCard,
        Tooltip,
        totalGeneratedTagCount,
    } = context;
    const Dashboard = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Selamat datang di Dashboard Admin. Pantau ringkasan operasional, total master data, dan statistik aktivitas scan tag di sini." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Brand" value={brands.length} icon={Building2} color="bg-[#C1986E]" />
                    <StatCard title="Total SKU Produk" value={products.length} icon={Package} color="bg-emerald-500" />
                    <StatCard title="Tag QR Aktif" value={new Intl.NumberFormat('id-ID').format(totalGeneratedTagCount)} icon={Tag} color="bg-purple-500" />
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

    return Dashboard;
}
