import React from 'react';
import { LayoutDashboard, Building2, Package, LogOut } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'brands', label: 'Manajemen Brand', icon: Building2 },
        { id: 'products', label: 'Produk SKU', icon: Package },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">M</div>
                <span className="font-bold text-xl tracking-tight">MKI Admin</span>
            </div>
            
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}