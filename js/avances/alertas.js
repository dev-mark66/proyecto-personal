// Avance: Alertas bonitas (toasts) y confirmaciones personalizadas
import { limpiarTexto } from './seguridad-xss.js';
const ICONOS = { ok: 'fa-circle-check', error: 'fa-circle-xmark', warn: 'fa-triangle-exclamation', info: 'fa-circle-info' };

export function toast(mensaje, tipo = 'ok') {
    let cont = document.getElementById('toasts');
    if (!cont) { cont = document.createElement('div'); cont.id = 'toasts'; document.body.appendChild(cont); }
    const t = document.createElement('div');
    t.className = `toast-e ${tipo}`;
    t.innerHTML = `<i class="fa-solid ${ICONOS[tipo] || ICONOS.ok}"></i><div class="flex-grow-1 small fw-semibold">${limpiarTexto(mensaje)}</div><span class="bar"></span>`;
    cont.appendChild(t);
    if (navigator.vibrate && tipo === 'error') navigator.vibrate(120);
    const quitar = () => { t.classList.add('out'); setTimeout(() => t.remove(), 350); };
    setTimeout(quitar, 3500);
    t.addEventListener('click', quitar);
}

export function confirmar(mensaje, { titulo = '¿Estás seguro?', icono = '⚠️', ok = 'Sí, continuar', cancelar = 'Cancelar' } = {}) {
    return new Promise(resolve => {
        const w = document.createElement('div');
        w.className = 'cf';
        w.innerHTML = `<div class="cf-box"><div class="ic">${icono}</div><h4 class="display-font">${limpiarTexto(titulo)}</h4>
            <p class="t-m">${limpiarTexto(mensaje)}</p>
            <div class="d-flex gap-2"><button class="btn btn-ghost w-100" data-r="0">${limpiarTexto(cancelar)}</button>
            <button class="btn btn-neon w-100" data-r="1">${limpiarTexto(ok)}</button></div></div>`;
        const fin = v => { w.remove(); resolve(v); };
        w.addEventListener('click', e => {
            if (e.target === w) fin(false);
            const b = e.target.closest('[data-r]'); if (b) fin(b.dataset.r === '1');
        });
        document.body.appendChild(w);
    });
}
