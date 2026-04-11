import React from 'react';
import {
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    User,
} from 'lucide-react';

export default function createSettings(context) {
    const {
        accountEmailInput,
        accountPasswordInput,
        authUser,
        emailNotif,
        handleSaveSecuritySettings,
        handleSaveAccountEmail,
        handleSaveAccountPassword,
        isBrandOwnerRole,
        isSavingAccountEmail,
        isSavingAccountPassword,
        isSavingSecuritySettings,
        PageAlert,
        requireGps,
        scanValidLimit,
        setActiveTab,
        setAccountEmailInput,
        setAccountPasswordInput,
        setEmailNotif,
        setRequireGps,
        setScanValidLimit,
        ToggleSwitch,
        Tooltip,
    } = context;
    const Settings = () => {
        const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = React.useState(false);
        const [isNewPasswordVisible, setIsNewPasswordVisible] = React.useState(false);
        const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);

        if (isBrandOwnerRole) {
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <PageAlert text="Halaman pengaturan akun Brand Owner. Anda dapat melihat profil sendiri dan memperbarui email/password login." />
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 w-full space-y-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User size={18} className="text-[#C1986E]" /> Profil Akun
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Nama</p>
                                    <p className="font-semibold text-slate-800">{authUser?.name || '-'}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Role</p>
                                    <p className="font-semibold text-slate-800">{authUser?.role || 'Brand Owner'}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:col-span-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Status</p>
                                    <p className="font-semibold text-slate-800">{Number(authUser?.status || 0) === 1 ? 'Aktif' : 'Non-aktif'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Mail size={18} className="text-[#C1986E]" /> Ubah Email Login
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                    value={accountEmailInput}
                                    onChange={(event) => setAccountEmailInput(event.target.value)}
                                    placeholder="email@domain.com"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveAccountEmail}
                                        disabled={isSavingAccountEmail}
                                        className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSavingAccountEmail ? 'Menyimpan...' : 'Simpan Email'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <KeyRound size={18} className="text-[#C1986E]" /> Ubah Password
                            </h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type={isCurrentPasswordVisible ? 'text' : 'password'}
                                        className="w-full border border-slate-200 rounded-lg px-4 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                        value={accountPasswordInput.currentPassword}
                                        onChange={(event) => setAccountPasswordInput((current) => ({ ...current, currentPassword: event.target.value }))}
                                        placeholder="Password saat ini"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsCurrentPasswordVisible((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={isCurrentPasswordVisible ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'}
                                    >
                                        {isCurrentPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={isNewPasswordVisible ? 'text' : 'password'}
                                        className="w-full border border-slate-200 rounded-lg px-4 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                        value={accountPasswordInput.newPassword}
                                        onChange={(event) => setAccountPasswordInput((current) => ({ ...current, newPassword: event.target.value }))}
                                        placeholder="Password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsNewPasswordVisible((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={isNewPasswordVisible ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
                                    >
                                        {isNewPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        className="w-full border border-slate-200 rounded-lg px-4 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm"
                                        value={accountPasswordInput.confirmPassword}
                                        onChange={(event) => setAccountPasswordInput((current) => ({ ...current, confirmPassword: event.target.value }))}
                                        placeholder="Konfirmasi password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={isConfirmPasswordVisible ? 'Sembunyikan konfirmasi password baru' : 'Tampilkan konfirmasi password baru'}
                                    >
                                        {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveAccountPassword}
                                        disabled={isSavingAccountPassword}
                                        className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSavingAccountPassword ? 'Menyimpan...' : 'Simpan Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Pengaturan sistem global. Hanya Super Admin yang dapat mengubah beberapa konfigurasi krusial keamanan." />
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 w-full">
                    <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Lock size={18} className="text-[#C1986E]" /> Konfigurasi Keamanan
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">Batas Maksimal Scan Valid</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Cek 1 sampai batas = "Terverifikasi Asli". Melebihi batas = "Peringatan Keamanan".</p>
                            </div>
                            <select
                                value={String(scanValidLimit)}
                                onChange={(event) => setScanValidLimit(Number(event.target.value))}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1986E] bg-slate-50"
                            >
                                <option value="3">3 Kali Scan</option>
                                <option value="5">5 Kali Scan</option>
                                <option value="10">10 Kali Scan</option>
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
                        <button
                            onClick={handleSaveSecuritySettings}
                            disabled={isSavingSecuritySettings}
                            className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSavingSecuritySettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return Settings;
}
