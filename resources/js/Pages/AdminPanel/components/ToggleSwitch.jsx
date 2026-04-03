import React from 'react';

export default function ToggleSwitch({ checked, onChange, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={(e) => { e.preventDefault(); if (!disabled && onChange) onChange(); }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C1986E]/50 focus:ring-offset-2 mx-1 ${checked ? 'bg-[#C1986E]' : 'bg-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}
