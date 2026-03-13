import React, { useState } from 'react';
import { Plus, Building2, MoreHorizontal, Search } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function BrandManagement({ brands }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '', brand_code: '', owner_name: '', description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('brands.store'), {
            onSuccess: () => { setShowModal(false); reset(); }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Daftar Brand</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> Tambah Brand
                </button>
            </div>

            {/* Tabel Brand */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Nama Brand</th>
                            <th className="p-4 font-semibold text-slate-600">Kode</th>
                            <th className="p-4 font-semibold text-slate-600">Owner</th>
                            <th className="p-4 font-semibold text-slate-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{brand.name}</td>
                                <td className="p-4 text-slate-600">{brand.brand_code}</td>
                                <td className="p-4 text-slate-600">{brand.owner_name}</td>
                                <td className="p-4"><MoreHorizontal className="text-slate-400 cursor-pointer" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah Brand */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Tambah Brand Baru</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Brand</label>
                                <input type="text" className="w-full border-slate-200 rounded-lg" 
                                    value={data.name} onChange={e => setData('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Kode Brand</label>
                                <input type="text" className="w-full border-slate-200 rounded-lg" 
                                    value={data.brand_code} onChange={e => setData('brand_code', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Owner</label>
                                <input type="text" className="w-full border-slate-200 rounded-lg" 
                                    value={data.owner_name} onChange={e => setData('owner_name', e.target.value)} />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg">Batal</button>
                                <button type="submit" disabled={processing} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}