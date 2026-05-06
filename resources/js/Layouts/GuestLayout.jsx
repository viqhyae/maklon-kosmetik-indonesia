import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-amber-50 to-white px-4 py-10">
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-[#C1986E]/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <Link href="/" className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <ApplicationLogo className="h-10 w-10 fill-current text-[#C1986E]" />
                    </Link>
                    <div>
                        <p className="text-lg font-bold text-slate-800">MKI Dashboard</p>
                        <p className="text-xs text-slate-500">Sistem Administrasi Brand & Produk</p>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 px-6 py-6 shadow-xl backdrop-blur">
                    {children}
                </div>
            </div>
        </div>
    );
}
