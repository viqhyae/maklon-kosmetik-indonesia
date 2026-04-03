import React from 'react';
import {
    Building2,
    CheckCircle2,
    Edit,
    Filter,
    Image as ImageIcon,
    Info,
    Key,
    Map,
    Plus,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';

export default function createBrandManager(context) {
    const {
        brandInput,
        brands,
        brandSort,
        brokenBrandLogoIds,
        buildBrandLogoSrc,
        editingBrandId,
        globalSearch,
        handleCancelEditBrand,
        handleDeleteBrand,
        handleEditBrand,
        handleSaveBrand,
        handleSortChange,
        isBrandActive,
        isBrandModalOpen,
        isSavingBrand,
        isUserActive,
        logoPreview,
        markBrandLogoBroken,
        normalizeBrandStatus,
        normalizeUserRole,
        openCreateBrandModal,
        PageAlert,
        products,
        savingBrandStatusId,
        setBrandInput,
        setBrandSort,
        setLogoFile,
        setLogoPreviewFromFile,
        SortIcon,
        systemUsers,
        toggleBrandStatusAutoSave,
        ToggleSwitch,
        Tooltip,
    } = context;
    const BrandManager = () => {
        const searchQuery = globalSearch.toLowerCase().trim();
        const productCountByBrandId = {};

        for (const product of products) {
            const brandId = Number(product.brandId);
            if (!Number.isFinite(brandId)) continue;
            productCountByBrandId[brandId] = (productCountByBrandId[brandId] || 0) + 1;
        }

        const filteredBrands = brands.filter((brand) => {
            if (!searchQuery) return true;

            return (
                brand.name.toLowerCase().includes(searchQuery) ||
                (brand.brand_code && brand.brand_code.toLowerCase().includes(searchQuery)) ||
                (brand.owner_name && brand.owner_name.toLowerCase().includes(searchQuery)) ||
                (brand.description && brand.description.toLowerCase().includes(searchQuery))
            );
        }).sort((a, b) => {
            const dir = brandSort.direction === 'asc' ? 1 : -1;
            if (brandSort.key === 'name') return a.name.localeCompare(b.name) * dir;
            if (brandSort.key === 'status') {
                if (a.status === b.status) return 0;
                return (normalizeBrandStatus(a.status) === 1 ? -1 : 1) * dir;
            }
            if (brandSort.key === 'sku') {
                const countA = productCountByBrandId[Number(a.id)] || 0;
                const countB = productCountByBrandId[Number(b.id)] || 0;
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
                                    const productCount = productCountByBrandId[Number(brand.id)] || 0;
                                    const ownerName = brand.owner_name || '';
                                    const logoSrc = buildBrandLogoSrc(brand);
                                    const hasBrokenLogo = brokenBrandLogoIds.includes(brand.id);

                                    return (
                                        <tr key={brand.id} className={`transition-colors ${isBrandActive(brand.status) ? 'hover:bg-slate-50' : 'bg-slate-50/50 grayscale-[20%]'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                                                        {logoSrc && !hasBrokenLogo ? (
                                                            <img
                                                                src={logoSrc}
                                                                alt="Logo"
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                                onError={() => markBrandLogoBroken(brand.id)}
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
                        onClick={() => { if (!isSavingBrand) handleCancelEditBrand(); }} // Fungsi tutup saat klik background
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
                                <button disabled={isSavingBrand} onClick={handleCancelEditBrand} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1.5 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><X size={18} /></button>
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
                                                        setLogoPreviewFromFile(file);
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
                                                    {systemUsers
                                                        .filter((user) => normalizeUserRole(user.role) === "Brand Owner" && isUserActive(user.status))
                                                        .map((user) => (
                                                        <option key={user.id} value={user.name}>{user.name}</option>
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
                                    <button type="button" disabled={isSavingBrand} onClick={handleCancelEditBrand} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed">Batal</button>
                                    <button type="submit" disabled={isSavingBrand} className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-sm active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed">{isSavingBrand ? "Menyimpan..." : (editingBrandId ? "Simpan Perubahan" : "Simpan Brand")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return BrandManager;
}
