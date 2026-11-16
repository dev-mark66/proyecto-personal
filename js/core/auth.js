// Roles: "cliente" y "admin"
import { ADMIN_PASS } from './config.js';
const KEY = 'eliteRol';
export const getRol = () => localStorage.getItem(KEY);
export const validarAdmin = p => p === ADMIN_PASS;
export function entrar(rol) {
    localStorage.setItem(KEY, rol);
    location.href = rol === 'admin' ? 'pages/admin.html' : 'pages/cliente.html';
}
export function requerirRol(rol) {
    const r = getRol();
    if (r === rol || (rol === 'cliente' && r === 'admin')) return true; // el admin también puede ver la tienda
    location.replace('../index.html'); return false;
}
export function logout() { localStorage.removeItem(KEY); location.href = '../index.html'; }
