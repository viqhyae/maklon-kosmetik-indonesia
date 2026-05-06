import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PageAlert({ text }) {
    return (
        <div className="flex gap-3 text-sm text-blue-700 bg-blue-50/80 p-4 rounded-xl border border-blue-200/60 items-start mb-2 shadow-sm">
            <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p>{text}</p>
        </div>
    );
}
