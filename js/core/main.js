// Punto de arranque común: protege la ruta por rol y activa los avances
import { iniciarHidratacion } from '../avances/hidratacion.js';
import { inicializarTema } from '../avances/tema.js';
import { inicializarAnimaciones } from '../avances/animaciones.js';
import { requerirRol, logout } from './auth.js';
import { registrarPWA } from './pwa.js';

export function arrancar(rol) {
    if (rol && !requerirRol(rol)) return false;
    window.logout = logout;
    inicializarTema();
    inicializarAnimaciones();
    iniciarHidratacion();
    registrarPWA();
    return true;
}
