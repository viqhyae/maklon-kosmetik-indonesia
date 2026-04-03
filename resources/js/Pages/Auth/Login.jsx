import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#C1986E] to-[#e6bd95] p-4 sm:p-6 lg:p-10">
            <Head title="Login" />

            <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-2">
                    <div className="relative h-56 sm:h-72 lg:h-auto">
                        <img
                            src="/images/login-cat.jpg"
                            alt="MKI Dashboard Login"
                            className="h-full w-full object-cover object-center"
                        />
                    </div>

                    <div className="flex items-center justify-center p-8 sm:p-10 lg:p-14">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-800">MKI Dashboard</h1>
                                <p className="mt-1 text-sm text-slate-500">Sistem Administrasi Brand &amp; Produk</p>
                            </div>

                            {status && (
                                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Masuk ke Dashboard</h2>
                                <p className="mt-1 text-sm text-slate-500">Gunakan username atau email dan password Anda.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="login" value="Username / Email" className="text-slate-700" />

                                    <TextInput
                                        id="login"
                                        type="text"
                                        name="login"
                                        value={data.login}
                                        className="mt-2 block w-full rounded-full border-slate-300 px-4 py-3 shadow-none focus:border-[#C1986E] focus:ring-[#C1986E]"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('login', e.target.value)}
                                    />

                                    <InputError message={errors.login} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-slate-700" />

                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-2 block w-full rounded-full border-slate-300 px-4 py-3 shadow-none focus:border-[#C1986E] focus:ring-[#C1986E]"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />

                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="pt-1">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <span className="ms-2 text-sm text-slate-600">Remember me</span>
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#C1986E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A37E58] focus:outline-none focus:ring-2 focus:ring-[#C1986E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={processing}
                                    >
                                        Log in
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
