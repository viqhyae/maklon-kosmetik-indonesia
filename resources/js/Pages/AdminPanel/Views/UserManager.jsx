import React from 'react';
import {
    CheckCircle2,
    Edit,
    Filter,
    Key,
    Map,
    Plus,
    Trash2,
    Users,
    X,
} from 'lucide-react';

export default function createUserManager(context) {
    const {
        createEmptyUserInput,
        editingUserId,
        globalSearch,
        handleCancelEditUser,
        handleDeleteUser,
        handleEditUser,
        handleOpenPasswordModal,
        handleSavePassword,
        handleSaveUser,
        handleSortChange,
        handleToggleUserStatus,
        isPasswordModalOpen,
        isSavingPassword,
        isSavingUser,
        isUserActive,
        isUserModalOpen,
        isUserPendingAction,
        normalizeUserRole,
        normalizeUserStatus,
        PageAlert,
        passwordData,
        setEditingUserId,
        setIsPasswordModalOpen,
        setIsUserModalOpen,
        setPasswordData,
        setUserInput,
        setUserSort,
        SortIcon,
        systemUsers,
        ToggleSwitch,
        Tooltip,
        userInput,
        userSort,
        userSubmitLockRef,
    } = context;
    const UserManager = () => {
        const userSearchQuery = globalSearch.toLowerCase().trim();
        const filteredUsers = systemUsers
            .filter((user) =>
                !userSearchQuery ||
                user.name.toLowerCase().includes(userSearchQuery) ||
                user.email.toLowerCase().includes(userSearchQuery) ||
                normalizeUserRole(user.role).toLowerCase().includes(userSearchQuery)
            )
            .sort((a, b) => {
                const dir = userSort.direction === 'asc' ? 1 : -1;
                if (userSort.key === 'name') return a.name.localeCompare(b.name) * dir;
                if (userSort.key === 'role') return normalizeUserRole(a.role).localeCompare(normalizeUserRole(b.role)) * dir;
                if (userSort.key === 'status') return (normalizeUserStatus(a.status) - normalizeUserStatus(b.status)) * dir;
                const idA = Number(a.id);
                const idB = Number(b.id);
                const normalizedIdA = Number.isFinite(idA) ? idA : Number.MIN_SAFE_INTEGER;
                const normalizedIdB = Number.isFinite(idB) ? idB : Number.MIN_SAFE_INTEGER;
                return (normalizedIdA - normalizedIdB) * dir;
            });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Kelola akses pengguna sistem di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Users size={18} className="text-[#C1986E]" /> Daftar Pengguna Sistem
                        </h3>
                        <button
                            onClick={() => {
                                if (isSavingUser) return;
                                userSubmitLockRef.current = false;
                                setUserInput(createEmptyUserInput());
                                setEditingUserId(null);
                                setIsUserModalOpen(true);
                            }}
                            disabled={isSavingUser}
                            className="bg-[#C1986E] text-white px-4 py-2 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 text-sm font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Tambah Pengguna
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] table-fixed text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="w-[40%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', userSort, setUserSort)}>
                                        <div className="flex items-center gap-2">Informasi Pengguna <SortIcon columnKey="name" sortConfig={userSort} /></div>
                                    </th>
                                    <th className="w-[18%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('role', userSort, setUserSort)}>
                                        <div className="flex items-center gap-2">Role Akses <SortIcon columnKey="role" sortConfig={userSort} /></div>
                                    </th>
                                    <th className="w-[16%] px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('status', userSort, setUserSort)}>
                                        <div className="flex items-center gap-2">Status <SortIcon columnKey="status" sortConfig={userSort} /></div>
                                    </th>
                                    <th className="w-[26%] px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-400">
                                            Tidak ada data pengguna yang cocok.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => {
                                    const userIsActive = isUserActive(user.status);
                                    const isPending = isUserPendingAction(user.id);

                                    return (
                                        <tr key={user.id} className={`transition-colors ${userIsActive ? 'hover:bg-slate-50' : 'bg-slate-50/60 grayscale-[20%]'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${userIsActive ? 'bg-[#C1986E]/10 text-[#C1986E]' : 'bg-slate-200 text-slate-500'}`}>
                                                        {(user.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-semibold text-sm truncate ${userIsActive ? 'text-slate-800' : 'text-slate-500'}`}>{user.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center justify-center min-w-[112px] text-xs px-3 py-1.5 rounded-full font-medium ${userIsActive ? (normalizeUserRole(user.role) === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') : 'bg-slate-200 text-slate-600'}`}>
                                                    {normalizeUserRole(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {userIsActive ? (
                                                    <span className="inline-flex items-center justify-center min-w-[92px] bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium gap-1">
                                                        <CheckCircle2 size={12} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center min-w-[92px] bg-slate-200 text-slate-500 text-xs px-2.5 py-1 rounded-full font-medium gap-1">
                                                        <X size={12} /> Non-aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Tooltip text={userIsActive ? "Nonaktifkan Akses" : "Aktifkan Akses"} position="top">
                                                        <ToggleSwitch
                                                            checked={userIsActive}
                                                            onChange={() => handleToggleUserStatus(user)}
                                                            disabled={isPending}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip text="Reset Sandi" position="top">
                                                        <button disabled={isPending} onClick={() => handleOpenPasswordModal(user)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><Key size={16} /></button>
                                                    </Tooltip>
                                                    <Tooltip text="Edit User" position="top">
                                                        <button disabled={isPending} onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><Edit size={16} /></button>
                                                    </Tooltip>
                                                    <Tooltip text="Hapus User" position="top">
                                                        <button disabled={isPending} onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={16} /></button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
                                    <button type="button" disabled={isSavingPassword} onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Batal</button>
                                    <button type="submit" disabled={isSavingPassword} className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed">{isSavingPassword ? "Menyimpan..." : "Simpan Sandi Baru"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Tambah/Edit User */}
                {isUserModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => { if (!isSavingUser) handleCancelEditUser(); }} // Fungsi tutup saat klik background
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
                                <button disabled={isSavingUser} onClick={handleCancelEditUser} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><X size={18} /></button>
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
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Status Akses</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1986E] text-sm bg-white"
                                            value={String(normalizeUserStatus(userInput.status))}
                                            onChange={(e) => setUserInput({ ...userInput, status: Number(e.target.value) })}
                                        >
                                            <option value="1">Aktif (Bisa Login)</option>
                                            <option value="0">Non-aktif (Tidak Bisa Login)</option>
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
                                                minLength={8}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
                                    <button type="button" disabled={isSavingUser} onClick={handleCancelEditUser} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Batal</button>
                                    <button type="submit" disabled={isSavingUser} className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed">{isSavingUser ? "Menyimpan..." : (editingUserId ? "Simpan Perubahan" : "Buat Akun")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return UserManager;
}
