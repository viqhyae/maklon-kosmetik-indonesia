import React from 'react';
import {
    Lock,
    Settings,
    Tag,
} from 'lucide-react';

export default function createSettings(context) {
    const {
        emailNotif,
        PageAlert,
        requireGps,
        setActiveTab,
        setEmailNotif,
        setRequireGps,
        ToggleSwitch,
        Tooltip,
    } = context;
    const Settings = () => {
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

    return Settings;
}
