import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export default function SortIcon({ columnKey, sortConfig }) {
    if (sortConfig.key !== columnKey) {
        return <ArrowUpDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }

    return sortConfig.direction === 'asc'
        ? <ArrowUp size={14} className="text-[#C1986E]" />
        : <ArrowDown size={14} className="text-[#C1986E]" />;
}
