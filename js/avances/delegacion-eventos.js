// Avance: Delegación de eventos (un solo listener por contenedor/selector/evento)
export function configurarDelegacionEventos(selectorContenedor, selectorHijo, evento, callback) {
    const contenedor = document.querySelector(selectorContenedor);
    if (!contenedor) return;

    contenedor._listeners = contenedor._listeners || {};
    const clave = evento + '|' + selectorHijo;
    if (contenedor._listeners[clave]) contenedor.removeEventListener(evento, contenedor._listeners[clave]);

    contenedor._listeners[clave] = function (e) {
        const target = e.target.closest(selectorHijo);
        if (target && contenedor.contains(target)) callback(e, target);
    };
    contenedor.addEventListener(evento, contenedor._listeners[clave]);
}
