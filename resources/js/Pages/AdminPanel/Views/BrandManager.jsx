import React from 'react';
import {
    Building2,
    CheckCircle2,
    Eye,
    Edit,
    Filter,
    Image as ImageIcon,
    Info,
    Key,
    Map,
    Plus,
    Trash2,
    X,
} from 'lucide-react';

const brandManagerContextRef = { current: null };

const BrandManager = () => {
    const context = brandManagerContextRef.current;
    if (!context) return null;

    const {
        brands,
        brandSort,
        brokenBrandLogoIds,
        buildBrandLogoSrc,
        globalSearch,
        handleDeleteBrand,
        handleEditBrand,
        handleSortChange,
        isBrandActive,
        isBrandOwnerRole,
        markBrandLogoBroken,
        normalizeBrandStatus,
        openCreateBrandModal,
        PageAlert,
        products,
        savingBrandStatusId,
        setBrandSort,
        SortIcon,
        toggleBrandStatusAutoSave,
        ToggleSwitch,
        Tooltip,
    } = context;
    const [previewBrand, setPreviewBrand] = React.useState(null);
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
    const previewBrandLogoSrc = previewBrand ? buildBrandLogoSrc(previewBrand) : null;
    const isPreviewLogoBroken = previewBrand ? brokenBrandLogoIds.includes(previewBrand.id) : false;
    const previewBrandSkuCount = previewBrand ? (productCountByBrandId[Number(previewBrand.id)] || 0) : 0;

    return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Halaman ini digunakan untuk mengelola data master Brand. Klik pada judul kolom di tabel untuk mengurutkan data." />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Total: {filteredBrands.length} Brand Terdaftar</span>
                    </div>
                    {!isBrandOwnerRole && (
                        <button
                            onClick={openCreateBrandModal}
                            className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Tambah Brand Baru
                        </button>
                    )}
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
                                        <tr key={brand.id} className={`transition-colors ${isBrandActive(brand.status) ? 'hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}`}>
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
                                                    <span className="inline-flex min-w-[94px] justify-center bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-1 rounded-full items-center gap-1">
                                                        <X size={12} /> Non-aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isBrandOwnerRole ? (
                                                        <Tooltip text="Preview Brand" position="top">
                                                            <button
                                                                onClick={() => setPreviewBrand(brand)}
                                                                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </Tooltip>
                                                    ) : (
                                                        <>
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
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {previewBrand && (
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setPreviewBrand(null)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center z-10 sticky top-0">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Eye size={18} className="text-[#C1986E]" /> Detail Informasi Brand
                                </h3>
                                <button
                                    onClick={() => setPreviewBrand(null)}
                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                                        <div className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 shadow-inner overflow-hidden">
                                            {previewBrandLogoSrc && !isPreviewLogoBroken ? (
                                                <img
                                                    src={previewBrandLogoSrc}
                                                    alt={previewBrand.name}
                                                    className="h-full w-full object-cover"
                                                    onError={() => markBrandLogoBroken(previewBrand.id)}
                                                />
                                            ) : (
                                                <>
                                                    <ImageIcon size={48} className="mb-3 text-slate-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Logo</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5">Total SKU Terdaftar</p>
                                            <p className="text-3xl font-extrabold text-blue-700 leading-none">
                                                {new Intl.NumberFormat('id-ID').format(previewBrandSkuCount)}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 mt-1">Produk SKU</p>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-2/3 flex flex-col">
                                        <div className="pb-5 border-b border-slate-100 mb-5">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Key size={11} /> {previewBrand.brand_code || `ID-${previewBrand.id}`}
                                                </span>
                                                {isBrandActive(previewBrand.status) ? (
                                                    <span className="inline-flex min-w-[94px] justify-center bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full items-center gap-1">
                                                        <CheckCircle2 size={12} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex min-w-[94px] justify-center bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-1 rounded-full items-center gap-1">
                                                        <X size={12} /> Non-aktif
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">{previewBrand.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#C1986E] font-bold flex items-center gap-1.5 bg-[#C1986E]/10 w-fit px-3 py-1.5 rounded-lg border border-[#C1986E]/20">
                                                    <Building2 size={16} /> {previewBrand.owner_name || 'Belum ditetapkan'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <Info size={14} className="text-slate-400" /> Detail Pemilik
                                                </p>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm text-slate-700 shadow-inner">
                                                    {previewBrand.owner_name || <span className="text-slate-400 italic">Brand ini belum memiliki pemilik.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end z-10 sticky bottom-0">
                                <button
                                    onClick={() => setPreviewBrand(null)}
                                    className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm"
                                >
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default function createBrandManager(context) {
    brandManagerContextRef.current = context;
    return BrandManager;
}
