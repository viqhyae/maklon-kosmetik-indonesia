import React from 'react';
import {
    Key,
    Map,
    Plus,
    Trash2,
    X,
} from 'lucide-react';

const categoryManagerContextRef = { current: null };

const CategoryManager = () => {
    const context = categoryManagerContextRef.current;
    if (!context) return null;

    const {
        addCategory,
        categories,
        deleteCategory,
        isBrandOwnerRole,
        isSameEntityId,
        isSavingCategory,
        newCatL1Name,
        newCatL2Name,
        newCatL3Name,
        PageAlert,
        selectedCatL1,
        selectedCatL2,
        setNewCatL1Name,
        setNewCatL2Name,
        setNewCatL3Name,
        setSelectedCatL1,
        setSelectedCatL2,
        Tooltip,
    } = context;
    const selectedLevel1Category = categories.find((category) =>
        isSameEntityId(category.id, selectedCatL1)
    );
    const selectedLevel2Category = selectedLevel1Category?.subCategories?.find((subCategory) =>
        isSameEntityId(subCategory.id, selectedCatL2)
    );

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <PageAlert text={isBrandOwnerRole ? "Kategori produk bersifat read-only untuk Brand Owner." : "Anda dapat menambah, menghapus, atau mengubah struktur kategori produk. Perubahan di sini akan mempengaruhi formulir input produk secara real-time."} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[350px] lg:h-full">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700">1. Kategori Utama</h3>
                        </div>
                        {!isBrandOwnerRole && (
                            <div className="p-3 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Tambah Baru..."
                                        className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        value={newCatL1Name}
                                        onChange={(e) => setNewCatL1Name(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') addCategory(1);
                                        }}
                                        disabled={isSavingCategory}
                                    />
                                    <button
                                        onClick={() => addCategory(1)}
                                        className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSavingCategory}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {categories.map(c1 => (
                                <div
                                    key={c1.id}
                                    onClick={() => {
                                        if (selectedCatL1 === c1.id) {
                                            setSelectedCatL1(null);
                                            setSelectedCatL2(null);
                                        } else {
                                            setSelectedCatL1(c1.id);
                                            setSelectedCatL2(null);
                                        }
                                    }}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL1 === c1.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <span>{c1.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${selectedCatL1 === c1.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c1.subCategories.length})</span>
                                        {!isBrandOwnerRole && selectedCatL1 === c1.id && (
                                            <Tooltip text="Hapus Kategori Utama" position="left">
                                                <button onClick={(e) => { e.stopPropagation(); deleteCategory(1, c1.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL1 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-700">2. Sub Kategori</h3>
                        </div>
                        {!isBrandOwnerRole && (
                            <div className="p-3 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={selectedCatL1 ? "Tambah Sub..." : "Pilih Utama dulu"}
                                        className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        value={newCatL2Name}
                                        onChange={(e) => setNewCatL2Name(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && selectedCatL1) addCategory(2);
                                        }}
                                        disabled={!selectedCatL1 || isSavingCategory}
                                    />
                                    <button
                                        onClick={() => addCategory(2)}
                                        className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!selectedCatL1 || isSavingCategory}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {selectedCatL1 && selectedLevel1Category?.subCategories.map(c2 => (
                                <div
                                    key={c2.id}
                                    onClick={() => {
                                        if (selectedCatL2 === c2.id) setSelectedCatL2(null);
                                        else setSelectedCatL2(c2.id);
                                    }}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedCatL2 === c2.id ? 'bg-[#C1986E]/10 text-[#C1986E] font-semibold border border-[#C1986E]/20' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                                >
                                    <span>{c2.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${selectedCatL2 === c2.id ? 'text-[#C1986E]' : 'text-slate-400'}`}>({c2.subSubCategories.length})</span>
                                        {!isBrandOwnerRole && selectedCatL2 === c2.id && (
                                            <Tooltip text="Hapus Sub Kategori" position="left">
                                                <button onClick={(e) => { e.stopPropagation(); deleteCategory(2, c2.id); }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 h-[350px] lg:h-full ${selectedCatL2 ? 'opacity-100 translate-x-0' : 'opacity-50 pointer-events-none'}`}>
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-700">3. Varian / Jenis</h3>
                        </div>
                        {!isBrandOwnerRole && (
                            <div className="p-3 border-b border-slate-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={selectedCatL2 ? "Tambah Varian..." : "Pilih Sub dulu"}
                                        className="flex-1 text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C1986E] focus:border-[#C1986E] disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        value={newCatL3Name}
                                        onChange={(e) => setNewCatL3Name(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && selectedCatL1 && selectedCatL2) addCategory(3);
                                        }}
                                        disabled={!selectedCatL2 || isSavingCategory}
                                    />
                                    <button
                                        onClick={() => addCategory(3)}
                                        className="bg-[#C1986E] text-white p-1.5 rounded-lg hover:bg-[#A37E58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!selectedCatL2 || isSavingCategory}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {selectedCatL1 && selectedCatL2 &&
                                selectedLevel2Category?.subSubCategories.map(c3 => (
                                    <div
                                        key={c3.id}
                                        className="flex justify-between items-center p-3 rounded-lg text-sm bg-white border border-slate-100 text-slate-700 hover:border-[#C1986E]/30 transition-colors"
                                    >
                                        <span>{c3.name}</span>
                                        {!isBrandOwnerRole && (
                                            <Tooltip text="Hapus Varian SKU" position="left">
                                                <button onClick={() => deleteCategory(3, c3.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg active:scale-95">
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                </div>
            </div>
        );
};

export default function createCategoryManager(context) {
    categoryManagerContextRef.current = context;
    return CategoryManager;
}
