import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';

const HIGH_ACCURACY_GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const FALLBACK_GEO_OPTIONS = {
    enableHighAccuracy: false,
    timeout: 6000,
    maximumAge: 60000,
};

const MAX_GEO_ATTEMPTS = 2;
const MAX_ACCEPTABLE_ACCURACY_METERS = 1200;

const requestBrowserPosition = (options) =>
    new Promise((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

const resolveBrowserCoordinates = async () => {
    if (
        typeof window === 'undefined' ||
        !window.navigator?.geolocation
    ) {
        return null;
    }

    for (let attempt = 1; attempt <= MAX_GEO_ATTEMPTS; attempt += 1) {
        let position = null;

        try {
            position = await requestBrowserPosition(HIGH_ACCURACY_GEO_OPTIONS);
        } catch {
            try {
                position = await requestBrowserPosition(FALLBACK_GEO_OPTIONS);
            } catch {
                position = null;
            }
        }

        if (!position?.coords) {
            continue;
        }

        const latitude = Number(position.coords.latitude);
        const longitude = Number(position.coords.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            continue;
        }

        const accuracy = Number(position.coords.accuracy);
        if (
            Number.isFinite(accuracy) &&
            accuracy > MAX_ACCEPTABLE_ACCURACY_METERS
        ) {
            if (attempt < MAX_GEO_ATTEMPTS) {
                continue;
            }

            return null;
        }

        return {
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
        };
    }

    return null;
};

export default function Welcome() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckCode = async (event) => {
        event.preventDefault();
        setResult(null);
        setErrorMessage('');

        const cleanedCode = String(code || '').trim().toUpperCase();
        if (cleanedCode === '') {
            setErrorMessage('Silakan masukkan kode verifikasi terlebih dahulu.');
            return;
        }

        setIsChecking(true);
        try {
            const coordinates = await resolveBrowserCoordinates();
            const response = await axios.get(route('public.verify-code'), {
                params: {
                    code: cleanedCode,
                    ...(coordinates || {}),
                },
            });
            setResult(response.data);
        } catch (error) {
            const validationMessage = error?.response?.data?.errors?.code?.[0];
            const message =
                validationMessage ||
                error?.response?.data?.message ||
                'Terjadi kendala saat memeriksa kode. Silakan coba lagi.';
            setErrorMessage(message);
        } finally {
            setIsChecking(false);
        }
    };

    const resultTone = useMemo(() => {
        if (!result) {
            return null;
        }

        if (!result.exists) {
            return {
                card: 'border-rose-200 bg-rose-50 text-rose-700',
                title: 'Kode tidak ditemukan',
            };
        }

        if (result.scan_status === 'Peringatan') {
            return {
                card: 'border-amber-300 bg-amber-50 text-amber-800',
                title: 'Waspada: kode sudah sering diverifikasi',
            };
        }

        if (result.scan_status === 'Suspended') {
            return {
                card: 'border-slate-300 bg-slate-100 text-slate-700',
                title: 'Kode terdeteksi tidak aktif',
            };
        }

        return {
            card: 'border-emerald-200 bg-emerald-50 text-emerald-800',
            title: 'Berhasil: kode terdaftar',
        };
    }, [result]);

    return (
        <>
            <Head title="Cek Keaslian Produk" />

            <div className="min-h-screen bg-[#f8f7f3] text-slate-900">
                <section className="border-b border-[#e8e2d7] bg-white/90">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                        <img
                            src="/img/LOGO_TOP.png.webp"
                            alt="Maklon Kosmetik Indonesia"
                            className="h-8 w-auto sm:h-10"
                        />
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('login')}
                                className="rounded-lg border border-[#d4c3a7] px-4 py-2 text-sm font-semibold text-[#8e6e4a] transition hover:bg-[#f8efe0]"
                            >
                                Login Admin
                            </Link>
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-[#c2986b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b1875c]"
                            >
                                /adminmki
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#eadcca]/70 blur-2xl" />
                    <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#f2e8db]/80 blur-2xl" />

                    <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b08558]">
                                Cek Keaslian Produk
                            </p>
                            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                                Verifikasi produk asli dengan cepat dan aman.
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                Masukkan kode unik pada kemasan untuk mengecek
                                status keaslian produk. Halaman ini disatukan
                                dalam satu local bersama dashboard admin.
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-xl border border-[#eadcca] bg-white/80 p-3">
                                    <img
                                        src="/img/qr-mki.png"
                                        alt="Scan QR"
                                        className="mx-auto h-10 w-auto"
                                        loading="lazy"
                                    />
                                    <p className="mt-2 text-xs font-semibold text-[#8e6e4a]">
                                        Scan QR
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#eadcca] bg-white/80 p-3">
                                    <img
                                        src="/img/kode-mki.png"
                                        alt="Gosok label"
                                        className="mx-auto h-10 w-auto"
                                        loading="lazy"
                                    />
                                    <p className="mt-2 text-xs font-semibold text-[#8e6e4a]">
                                        Ambil Kode
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#eadcca] bg-white/80 p-3">
                                    <img
                                        src="/img/cek-mki.png"
                                        alt="Cek verifikasi"
                                        className="mx-auto h-10 w-auto"
                                        loading="lazy"
                                    />
                                    <p className="mt-2 text-xs font-semibold text-[#8e6e4a]">
                                        Verifikasi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#e8dccb] bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                Masukkan Kode Verifikasi
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Gunakan kode dari label pelindung produk.
                            </p>

                            <form
                                onSubmit={handleCheckCode}
                                className="mt-5 space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="verification-code"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Kode
                                    </label>
                                    <input
                                        id="verification-code"
                                        type="text"
                                        value={code}
                                        onChange={(event) =>
                                            setCode(
                                                String(event.target.value || '')
                                                    .toUpperCase()
                                                    .replace(/\s+/g, ''),
                                            )
                                        }
                                        placeholder="Contoh: ABC1234"
                                        className="w-full rounded-xl border border-[#ddcfbb] px-4 py-3 text-base uppercase tracking-[0.14em] text-slate-900 outline-none transition focus:border-[#c2986b] focus:ring-2 focus:ring-[#efe2d0]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isChecking}
                                    className="w-full rounded-xl bg-[#c2986b] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#b1875c] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isChecking ? 'Memeriksa...' : 'Cek Kode'}
                                </button>
                            </form>

                            {errorMessage !== '' && (
                                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {errorMessage}
                                </div>
                            )}

                            {result && resultTone && (
                                <div
                                    className={`mt-4 rounded-xl border px-4 py-4 text-sm ${resultTone.card}`}
                                >
                                    <p className="font-bold">{resultTone.title}</p>
                                    <p className="mt-1">{result.message}</p>
                                    <div className="mt-3 grid gap-1 text-sm">
                                        <p>
                                            <span className="font-semibold">
                                                Kode:
                                            </span>{' '}
                                            {result.code || code}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Jumlah verifikasi:
                                            </span>{' '}
                                            {result.scan_count || 0} kali
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Batas aman:
                                            </span>{' '}
                                            {result.max_valid_scan_limit || '-'}{' '}
                                            kali
                                        </p>
                                        {result.exists && (
                                            <>
                                                <p>
                                                    <span className="font-semibold">
                                                        Produk:
                                                    </span>{' '}
                                                    {result.product_name || '-'}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">
                                                        Brand:
                                                    </span>{' '}
                                                    {result.brand_name || '-'}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">
                                                        Status:
                                                    </span>{' '}
                                                    {result.status || '-'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b08558]">
                        Fitur Utama
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        Alur verifikasi sederhana, tetap kuat untuk proteksi.
                    </h3>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#eadcca] bg-white p-4">
                            <img
                                src="/img/keamanan-mki.png"
                                alt="Keamanan Tinggi"
                                className="h-12 w-auto"
                                loading="lazy"
                            />
                            <h4 className="mt-3 text-base font-bold text-slate-900">
                                Keamanan Tinggi
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                                Kode unik membantu mencegah pemalsuan produk.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#eadcca] bg-white p-4">
                            <img
                                src="/img/verifikasi-mki.png"
                                alt="Verifikasi Online"
                                className="h-12 w-auto"
                                loading="lazy"
                            />
                            <h4 className="mt-3 text-base font-bold text-slate-900">
                                Verifikasi Online
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                                Cek kode langsung dari halaman ini kapan saja.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#eadcca] bg-white p-4">
                            <img
                                src="/img/implementasi-mki.png"
                                alt="Implementasi Mudah"
                                className="h-12 w-auto"
                                loading="lazy"
                            />
                            <h4 className="mt-3 text-base font-bold text-slate-900">
                                Implementasi Mudah
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                                Tetap ringan, cepat, dan cocok untuk satu local.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-[#eadcca] bg-white">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f7f1e7] text-[#7c5f3f]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">
                                        Perbandingan
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Hologram
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Label Verifikasi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-[#f0e7da]">
                                    <td className="px-4 py-3">
                                        Desain Sesuai Brand
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src="/img/cek-hijau-mki.png"
                                            alt="Ya"
                                            className="h-4 w-4"
                                            loading="lazy"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src="/img/cek-hijau-mki.png"
                                            alt="Ya"
                                            className="h-4 w-4"
                                            loading="lazy"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-t border-[#f0e7da]">
                                    <td className="px-4 py-3">
                                        Kode Unik Tiap Produk
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src="/img/cek-abu-mki.png"
                                            alt="Terbatas"
                                            className="h-4 w-4"
                                            loading="lazy"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src="/img/cek-hijau-mki.png"
                                            alt="Ya"
                                            className="h-4 w-4"
                                            loading="lazy"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}
