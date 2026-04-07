import React from 'react';
import {
    ChevronRight,
    Database,
    FileText,
    Filter,
    Info,
    Key,
    Map,
    Package,
    Search,
    UploadCloud,
    X,
} from 'lucide-react';

export default function createProductForm(context) {
    const {
        activeFormSection,
        brands,
        categories,
        catSearchKeyword,
        handleCancelEditProduct,
        handleSaveProduct,
        isBrandActive,
        isCategoryModalOpen,
        isSavingProduct,
        PRODUCT_SPEC_SCHEMA,
        productInput,
        productImagePreview,
        setProductImageFile,
        setProductImagePreviewFromFile,
        setActiveFormSection,
        setCatSearchKeyword,
        setIsCategoryModalOpen,
        setProductInput,
        setTempCategory,
        tempCategory,
        Tooltip,
    } = context;
    const ProductForm = () => {
        // --- SAFEGUARD --- Memastikan dynamicFields selalu berupa objek
        const currentDynamicFields = productInput.dynamicFields || {};

        // --- HELPER SCROLL KE SEKSI FORM ---
        const scrollToSection = (sectionId) => {
            setActiveFormSection(sectionId);
            const element = document.getElementById(`form-${sectionId}`);
            if (element) {
                // Karena wadah utama sekarang adalah overflow-y-auto, kita gunakan scrollIntoView
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        // --- LOGIKA UNTUK MODAL KATEGORI ---
        const getFlattenedCategories = () => {
            let paths = [];
            categories.forEach(c1 => {
                c1.subCategories.forEach(c2 => {
                    c2.subSubCategories.forEach(c3 => {
                        if (!catSearchKeyword ||
                            c1.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c2.name.toLowerCase().includes(catSearchKeyword.toLowerCase()) ||
                            c3.name.toLowerCase().includes(catSearchKeyword.toLowerCase())) {
                            paths.push({ l1: c1.id, l2: c2.id, l3: c3.id, path: `${c1.name} > ${c2.name} > ${c3.name}` });
                        }
                    });
                });
            });
            return paths;
        };

        const getSelectedCategoryText = (l1, l2, l3) => {
            if (!l1) return "Pilih Kategori Produk";
            const c1 = categories.find(c => c.id == l1);
            const c2 = c1?.subCategories.find(c => c.id == l2);
            const c3 = c2?.subSubCategories.find(c => c.id == l3);
            if (!c1) return "Kategori Tidak Valid";
            return `${c1.name}${c2 ? ` > ${c2.name}` : ''}${c3 ? ` > ${c3.name}` : ''}`;
        };

        const handleConfirmCategory = () => {
            setProductInput({
                ...productInput,
                catL1: tempCategory.l1,
                catL2: tempCategory.l2,
                catL3: tempCategory.l3,
                // Reset dynamic fields jika kategori berubah
                dynamicFields: (productInput.catL2 != tempCategory.l2) ? {} : productInput.dynamicFields
            });
            setIsCategoryModalOpen(false);
        };

        const openCategoryModal = () => {
            setTempCategory({ l1: productInput.catL1 || '', l2: productInput.catL2 || '', l3: productInput.catL3 || '' });
            setCatSearchKeyword('');
            setIsCategoryModalOpen(true);
        };

        return (
            <div className="mt-0 md:mt-0 pb-20">

                {/* Header Form & Navigasi Sticky - Full Width sejajar dengan Buttons */}
                <div className="sticky top-0 z-[100] bg-white border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 mb-8 shadow-sm">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 md:py-4">

                        {/* Tab Navigasi */}
                        <div className="flex gap-6 overflow-x-auto hide-scrollbar-mobile w-full sm:w-auto">
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('info'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'info' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Informasi Produk</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('spec'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'spec' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Spesifikasi</button>
                            <button onClick={(e) => { e.preventDefault(); scrollToSection('desc'); }} className={`pb-3 pt-1 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeFormSection === 'desc' ? 'border-[#C1986E] text-[#C1986E]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Deskripsi</button>
                        </div>

                        {/* Buttons Action */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button type="button" onClick={handleCancelEditProduct} disabled={isSavingProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-sm hidden sm:block disabled:opacity-50 disabled:cursor-not-allowed">Batal</button>
                            <button onClick={handleSaveProduct} disabled={isSavingProduct} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                <Package size={16} /> {isSavingProduct ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Pembungkus Max Width untuk Area Form Utama */}
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSaveProduct} className="space-y-8 flex flex-col">

                        {/* BAGIAN 1: INFORMASI PRODUK */}
                        {/* scroll-mt-44 digunakan agar judul form tidak tertutup navbar sticky saat di scroll otomatis */}
                        <div id="form-info" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <Info size={18} className="text-[#C1986E]" /> Informasi Dasar Produk
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Kiri: Upload Gambar (Rasio 1:1) */}
                                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                                    <label className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#C1986E] transition-all group bg-slate-50/50 p-4 text-center relative overflow-hidden">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={isSavingProduct}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;

                                                setProductImageFile(file);
                                                setProductImagePreviewFromFile(file);
                                            }}
                                        />

                                        {productImagePreview ? (
                                            <img src={productImagePreview} alt="Preview produk" className="absolute inset-0 h-full w-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                    <UploadCloud size={28} className="text-slate-400 group-hover:text-[#C1986E]" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 mb-1">Pilih / Tarik Foto</span>
                                            </>
                                        )}
                                    </label>
                                    <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                                        Format: JPG, PNG, WEBP<br />Ukuran Maksimal: 2MB<br />Rasio Gambar: 1:1 (Persegi)
                                    </div>
                                </div>

                                {/* Kanan: Form Inputan Utama */}
                                <div className="flex-1 w-full space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Produk <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Sabun Cuci Muka Glowing 100ml"
                                            maxLength={255}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white"
                                            value={productInput.name}
                                            onChange={(e) => setProductInput({ ...productInput, name: e.target.value })}
                                            required
                                        />
                                        <div className="text-right text-[10px] text-slate-400">{productInput.name.length}/255 Karakter</div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                                <span>Kode SKU <span className="text-red-500">*</span></span>
                                                <Tooltip text="Stock Keeping Unit (Kode Unik Internal Produk)"><Info size={14} className="text-slate-400 cursor-help" /></Tooltip>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: GLW-FW-100"
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm font-mono uppercase bg-slate-50/50 hover:bg-white"
                                                value={productInput.skuCode || ''}
                                                onChange={(e) => setProductInput({ ...productInput, skuCode: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Brand Utama <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all text-sm bg-slate-50/50 hover:bg-white cursor-pointer"
                                                value={productInput.brandId || ''}
                                                onChange={(e) => setProductInput({ ...productInput, brandId: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled>-- Pilih Brand Terdaftar --</option>
                                                {brands.filter(b => isBrandActive(b.status)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori Produk <span className="text-red-500">*</span></label>
                                        <div
                                            onClick={openCategoryModal}
                                            className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all text-sm group ${productInput.catL3 ? 'border-[#C1986E] bg-[#C1986E]/5 text-[#C1986E]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#C1986E]/50 text-slate-500'}`}
                                        >
                                            <div className="flex flex-col">
                                                {productInput.catL3 ? (
                                                    <>
                                                        <span className="font-semibold text-slate-800">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3).split(' > ').pop()}</span>
                                                        <span className="text-[10px] text-[#C1986E] mt-0.5">{getSelectedCategoryText(productInput.catL1, productInput.catL2, productInput.catL3)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">Klik untuk mengatur kategori...</span>
                                                )}
                                            </div>
                                            <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${productInput.catL3 ? 'text-[#C1986E]' : 'text-slate-400'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BAGIAN 2: SPESIFIKASI DINAMIS */}
                        <div id="form-spec" className="scroll-mt-44">
                            {PRODUCT_SPEC_SCHEMA[productInput.catL2] ? (() => {
                                const schema = PRODUCT_SPEC_SCHEMA[productInput.catL2];
                                const IconCmp = schema.icon;
                                return (
                                    <div className={`rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 border shadow-sm bg-white ${schema.theme.border}`}>
                                        <h3 className={`font-bold flex items-center gap-2 text-base border-b border-slate-100 pb-3 ${schema.theme.title}`}>
                                            <IconCmp size={18} /> {schema.title}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {schema.fields.map((field) => (
                                                <div key={field.name} className={`space-y-1.5 ${field.colSpan === 2 ? 'md:col-span-2' : ''}`}>
                                                    <label className={`text-xs font-bold uppercase tracking-wide ${schema.theme.label}`}>{field.label}</label>
                                                    {field.type === 'select' ? (
                                                        <select
                                                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-sm bg-slate-50/50 hover:bg-white border transition-colors cursor-pointer ${schema.theme.input}`}
                                                            value={currentDynamicFields[field.name] || ''}
                                                            onChange={(e) => setProductInput({ ...productInput, dynamicFields: { ...currentDynamicFields, [field.name]: e.target.value } })}
                                                        >
                                                            <option value="">-- Pilih --</option>
                                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder={field.placeholder}
                                                            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-sm bg-slate-50/50 hover:bg-white border transition-colors ${schema.theme.input}`}
                                                            value={currentDynamicFields[field.name] || ''}
                                                            onChange={(e) => setProductInput({ ...productInput, dynamicFields: { ...currentDynamicFields, [field.name]: e.target.value } })}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400 text-sm shadow-sm flex flex-col items-center gap-2">
                                    <Database size={24} className="text-slate-300" />
                                    <p>Silakan pilih Kategori Produk terlebih dahulu untuk memunculkan form spesifikasi yang sesuai.</p>
                                </div>
                            )}
                        </div>

                        {/* BAGIAN 3: DESKRIPSI */}
                        <div id="form-desc" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 scroll-mt-44">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                                <FileText size={18} className="text-[#C1986E]" /> Deskripsi Produk
                            </h3>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                                    <span>Keterangan Detail / Manfaat / Panduan Penggunaan</span>
                                    <span className="text-[10px] text-slate-400 font-normal normal-case bg-slate-100 px-2 py-0.5 rounded">Opsional</span>
                                </label>
                                <textarea
                                    rows="6"
                                    placeholder="Tuliskan keterangan detail, manfaat, komposisi (ingredients), atau cara penggunaan produk yang nantinya dapat dibaca oleh pelanggan saat melakukan verifikasi..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:border-[#C1986E] transition-all resize-y text-sm bg-slate-50/50 hover:bg-white leading-relaxed"
                                    value={productInput.description}
                                    onChange={(e) => setProductInput({ ...productInput, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- MODAL PICKER KATEGORI --- */}
                {isCategoryModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
                        onClick={() => setIsCategoryModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] sm:h-[70vh] animate-in zoom-in-95"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header & Search */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 flex-1 shadow-sm focus-within:border-[#C1986E] focus-within:ring-1 focus-within:ring-[#C1986E] transition-all">
                                    <Search size={18} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Cari kategori... (Contoh: Parfum, Wajah)"
                                        className="bg-transparent border-none outline-none text-sm w-full focus:ring-0"
                                        value={catSearchKeyword}
                                        onChange={(e) => setCatSearchKeyword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-hidden bg-white flex flex-col relative">
                                {catSearchKeyword ? (
                                    /* Tampilan Pencarian */
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                                        {getFlattenedCategories().length > 0 ? (
                                            getFlattenedCategories().map(item => (
                                                <div
                                                    key={item.path}
                                                    onClick={() => setTempCategory({ l1: item.l1, l2: item.l2, l3: item.l3 })}
                                                    className={`p-3 sm:px-4 rounded-xl cursor-pointer text-sm border transition-all ${tempCategory.l3 === item.l3 ? 'bg-[#C1986E]/10 border-[#C1986E]/30 text-[#C1986E] font-semibold' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}
                                                >
                                                    {item.path}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 p-8 text-sm">Kategori tidak ditemukan.</div>
                                        )}
                                    </div>
                                ) : (
                                    /* Tampilan Cascading 3 Kolom */
                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Kolom 1 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">1. Induk Kategori</h5>
                                            {categories.map(c1 => (
                                                <div
                                                    key={c1.id}
                                                    onClick={() => setTempCategory({ l1: c1.id, l2: '', l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l1 == c1.id ? 'bg-slate-800 text-white font-medium shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    <span>{c1.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l1 == c1.id ? 'text-slate-400' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 2 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar border-r border-slate-100 bg-slate-50/30 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">2. Sub Kategori</h5>
                                            {!tempCategory.l1 && <p className="text-xs text-slate-400 px-2 italic">Pilih Induk Kategori dulu</p>}
                                            {tempCategory.l1 && categories.find(c => c.id == tempCategory.l1)?.subCategories.map(c2 => (
                                                <div
                                                    key={c2.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l2: c2.id, l3: '' })}
                                                    className={`p-3 rounded-xl flex justify-between items-center cursor-pointer text-sm mb-1 transition-all ${tempCategory.l2 == c2.id ? 'bg-white border border-[#C1986E] text-[#C1986E] font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'}`}
                                                >
                                                    <span>{c2.name}</span>
                                                    <ChevronRight size={14} className={tempCategory.l2 == c2.id ? 'text-[#C1986E]/50' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Kolom 3 */}
                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50 hide-scrollbar-mobile">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">3. Varian Akhir</h5>
                                            {!tempCategory.l2 && <p className="text-xs text-slate-400 px-2 italic">Pilih Sub Kategori dulu</p>}
                                            {tempCategory.l2 && categories.find(c => c.id == tempCategory.l1)?.subCategories.find(s => s.id == tempCategory.l2)?.subSubCategories.map(c3 => (
                                                <div
                                                    key={c3.id}
                                                    onClick={() => setTempCategory({ ...tempCategory, l3: c3.id })}
                                                    className={`p-3 rounded-xl cursor-pointer text-sm mb-1 transition-all ${tempCategory.l3 == c3.id ? 'bg-[#C1986E] text-white font-bold shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#C1986E]/50'}`}
                                                >
                                                    {c3.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="text-sm w-full sm:w-auto">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Kategori Terpilih:</span>
                                    <div className="font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 break-words line-clamp-2">
                                        {getSelectedCategoryText(tempCategory.l1, tempCategory.l2, tempCategory.l3)}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                                    <button
                                        onClick={handleConfirmCategory}
                                        disabled={!tempCategory.l3}
                                        className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold text-white bg-[#C1986E] hover:bg-[#A37E58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return ProductForm;
}
