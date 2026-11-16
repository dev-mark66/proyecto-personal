// PWA: Service Worker, botón instalar y aviso online/offline
import { toast } from '../avances/alertas.js';
let evt = null;
export function registrarPWA() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        const ruta = location.pathname.includes('/pages/') ? '../sw.js' : 'sw.js';
        navigator.serviceWorker.register(ruta).catch(() => {});
    }
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault(); evt = e;
        document.querySelectorAll('.js-instalar').forEach(b => b.classList.remove('d-none'));
    });
    window.instalarApp = async () => {
        if (!evt) return toast('Usa "Agregar a pantalla de inicio" en el menú de tu navegador', 'info');
        evt.prompt(); await evt.userChoice; evt = null;
        document.querySelectorAll('.js-instalar').forEach(b => b.classList.add('d-none'));
    };
    window.addEventListener('offline', () => toast('Sin conexión: modo offline activado', 'warn'));
    window.addEventListener('online', () => toast('¡Conexión recuperada!', 'ok'));
}
