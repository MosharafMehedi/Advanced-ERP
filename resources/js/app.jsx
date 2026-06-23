import '../css/app.css';
// import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { usePage } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        const appName = usePage ? window._sharedData?.globalSettings?.app_name : 'Laravel'; 
        return title ? `${title} - ${appName}` : appName;
    },
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        window._sharedData = props.initialPage.props; 
        
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
});
