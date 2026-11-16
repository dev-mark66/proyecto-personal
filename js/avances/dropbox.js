// Avance: Normaliza enlaces de imágenes (Dropbox o rutas del repositorio)
export function normalizarImagen(url) {
    if (!url) return '';
    url = String(url).trim();
    if (url.startsWith('assets/')) return '../' + url;      // imagen local del repositorio
    try {
        const u = new URL(url);
        if (!/^https?:$/.test(u.protocol)) return '';        // bloquea javascript:, data:, etc.
        if (u.hostname.endsWith('dropbox.com')) {
            u.searchParams.delete('dl');
            u.searchParams.set('raw', '1');
        }
        return u.toString();
    } catch { return url.startsWith('../') ? url : ''; }
}
