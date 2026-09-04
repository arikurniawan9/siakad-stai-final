import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const defaultAppName = 'SIAKAD STAI Al-Ittihad';

createInertiaApp({
    title: (title) => {
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return defaultAppName;
        }

        // Bersihkan suffix berulang agar title browser selalu rapi
        let clean = title.trim()
            .replace(/\s*[—–|-]\s*SIAKAD\s*STAI\s*Al-Ittihad\s*$/i, '')
            .replace(/\s*[—–|-]\s*STAI\s*Al-Ittihad\s*$/i, '')
            .replace(/\s*[—–|-]\s*SIAKAD\s*$/i, '')
            .replace(/\s*[—–|-]\s*Superadmin\s*$/i, '')
            .trim();

        if (!clean || clean.toLowerCase() === defaultAppName.toLowerCase() || clean.toLowerCase() === 'siakad') {
            return defaultAppName;
        }

        return `${clean} | ${defaultAppName}`;
    },
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#107C41',
        showSpinner: true,
    },
});
