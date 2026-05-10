import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const exactPageTitles = new Set([
    'Selamat Datang di Halaman Login',
    'Dashboard Admin MKI',
]);

if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', (event) => {
        const navigationEntries = window.performance?.getEntriesByType?.('navigation') || [];
        const navigationEntry = navigationEntries[0];
        const isBackForwardNavigation = event.persisted || navigationEntry?.type === 'back_forward';

        if (isBackForwardNavigation && window.location.pathname.startsWith('/adminmki')) {
            window.location.reload();
        }
    });
}

createInertiaApp({
    title: (title) => (exactPageTitles.has(title) ? title : `${title} - ${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
