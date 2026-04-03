import React from 'react';
import {
    AlertCircle,
    Building2,
    ChevronRight,
    Database,
    Edit,
    Eye,
    FileText,
    Filter,
    Image as ImageIcon,
    Info,
    Key,
    Layers,
    Map,
    Menu,
    Package,
    Plus,
    Tag,
    Trash2,
    X,
} from 'lucide-react';

export default function createProductManager(context) {
    const {
        batches,
        brands,
        globalSearch,
        handleDeleteProduct,
        handleEditProduct,
        handleSortChange,
        PageAlert,
        PRODUCT_SPEC_SCHEMA,
        products,
        productSort,
        selectedProductDetail,
        setActiveTab,
        setEditingProductId,
        setProductInput,
        setProductSort,
        setSelectedProductDetail,
        SortIcon,
        Tooltip,
    } = context;
    const ProductManager = () => {
        if (brands.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
                    <AlertCircle size={48} className="text-yellow-600" />
                    <h2 className="text-xl font-bold text-slate-800">Brand Belum Tersedia</h2>
                    <button onClick={() => setActiveTab('brand')} className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm">Pergi ke Menu Brand</button>
                </div>
            );
        }

        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.brandName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.categoryPath.toLowerCase().includes(globalSearch.toLowerCase())
        ).sort((a, b) => {
            const dir = productSort.direction === 'asc' ? 1 : -1;
            if (productSort.key === 'name') return a.name.localeCompare(b.name) * dir;
            if (productSort.key === 'category') return a.categoryPath.localeCompare(b.categoryPath) * dir;
            if (productSort.key === 'tags') {
                const tagsA = batches.filter(batch => batch.productName === a.name).reduce((sum, batch) => sum + batch.qty, 0);
                const tagsB = batches.filter(batch => batch.productName === b.name).reduce((sum, batch) => sum + batch.qty, 0);
                return (tagsA - tagsB) * dir;
            }
            return (a.id - b.id) * dir;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text="Kelola Master Data SKU Produk di sini. Klik pada judul kolom di tabel untuk mengurutkan data." />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">Total: {filteredProducts.length} Produk SKU</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProductId(null);
                            setProductInput({ name: '', brandId: '', description: '', catL1: '', catL2: '', catL3: '', skuCode: '', dynamicFields: {} });
                            setActiveTab('product_form');
                        }}
                        className="bg-[#C1986E] hover:bg-[#A37E58] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} /> Tambah SKU Baru
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('name', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Produk Info <SortIcon columnKey="name" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('sku', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Kode SKU <SortIcon columnKey="sku" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('category', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Kategori <SortIcon columnKey="category" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSortChange('tags', productSort, setProductSort)}>
                                    <div className="flex items-center gap-2">Tag Dibuat <SortIcon columnKey="tags" sortConfig={productSort} /></div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-sm">Tidak ada produk yang sesuai dengan pencarian.</td></tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const tagCount = batches
                                        .filter(b => b.productName === product.name)
                                        .reduce((total, b) => total + b.qty, 0);

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="font-medium text-slate-800 text-sm truncate" title={product.name}>{product.name}</span>
                                                        <span className="text-xs text-[#C1986E] font-medium flex items-center gap-1 mt-0.5 truncate"><Building2 size={12} /> {product.brandName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                                                    {product.skuCode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-500 max-w-[220px] whitespace-normal" title={product.categoryPath}>
                                                    {product.categoryPath.split(' > ').map((p, i, arr) => (
                                                        <span key={i} className="inline-block">
                                                            {p} {i < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                                                    {new Intl.NumberFormat('id-ID').format(tagCount)} Tag
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Tooltip text="Lihat Detail Produk" position="top">
                                                        <button onClick={() => setSelectedProductDetail(product)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Edit Produk" position="top">
                                                        <button onClick={() => handleEditProduct(product)} className="text-slate-400 hover:text-[#C1986E] hover:bg-[#C1986E]/10 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Edit size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Hapus Data Produk" position="top">
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Detail Produk */}
                {selectedProductDetail && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedProductDetail(null)} // Fungsi tutup saat klik background
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                        >
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center z-10 sticky top-0">
                                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                                    <Eye size={18} className="text-[#C1986E]" /> Detail Informasi Produk
                                </h3>
                                <button onClick={() => setSelectedProductDetail(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all p-1.5 rounded-lg active:scale-95"><X size={18} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col md:flex-row gap-8">

                                    {/* Kolom Kiri: Visual & Statistik Utama */}
                                    <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                                        <div className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 shadow-inner">
                                            <ImageIcon size={48} className="mb-3 text-slate-300" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Foto</span>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5">Total Tag QR Dibuat</p>
                                            <p className="text-3xl font-extrabold text-blue-700 leading-none">
                                                {new Intl.NumberFormat('id-ID').format(
                                                    batches
                                                        .filter(b => b.productName === selectedProductDetail.name)
                                                        .reduce((total, b) => total + b.qty, 0)
                                                )}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 mt-1">Tag Keamanan</p>
                                        </div>
                                    </div>

                                    {/* Kolom Kanan: Detail Data SKU */}
                                    <div className="w-full md:w-2/3 flex flex-col">
                                        <div className="pb-5 border-b border-slate-100 mb-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-widest">
                                                    SKU: {selectedProductDetail.skuCode || 'NO-SKU'}
                                                </span>
                                            </div>
                                            <h4 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">{selectedProductDetail.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#C1986E] font-bold flex items-center gap-1.5 bg-[#C1986E]/10 w-fit px-3 py-1.5 rounded-lg border border-[#C1986E]/20">
                                                    <Building2 size={16} /> {selectedProductDetail.brandName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Detail Kategori (Breadcrumb Style) */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <Layers size={14} className="text-slate-400" /> Struktur Kategori
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {selectedProductDetail.categoryPath.split(' > ').map((item, index, arr) => (
                                                        <React.Fragment key={index}>
                                                            <span className={`text-xs px-3 py-1.5 rounded-lg shadow-sm border ${index === arr.length - 1
                                                                ? 'bg-slate-800 text-white font-medium border-slate-800'
                                                                : 'bg-white text-slate-600 border-slate-200 font-medium'
                                                                }`}>
                                                                {item}
                                                            </span>
                                                            {index < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Spesifikasi Dinamis */}
                                            {selectedProductDetail.dynamicFields && Object.keys(selectedProductDetail.dynamicFields).length > 0 && PRODUCT_SPEC_SCHEMA[selectedProductDetail.catL2] && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                        <Database size={14} className="text-slate-400" /> Spesifikasi Khusus
                                                    </p>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {PRODUCT_SPEC_SCHEMA[selectedProductDetail.catL2].fields.map(field => (
                                                            <div key={field.name} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{field.label}</p>
                                                                <p className="text-sm font-semibold text-slate-700">{selectedProductDetail.dynamicFields[field.name] || '-'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Deskripsi */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                    <FileText size={14} className="text-slate-400" /> Keterangan / Deskripsi Produk
                                                </p>
                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[120px] shadow-inner">
                                                    {selectedProductDetail.description || <span className="text-slate-400 italic">Tidak ada deskripsi yang ditambahkan untuk produk ini.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end z-10 sticky bottom-0">
                                <button type="button" onClick={() => setSelectedProductDetail(null)} className="px-8 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md active:scale-95 text-sm">
                                    Tutup Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return ProductManager;
}
