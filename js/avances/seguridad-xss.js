// Avance: Sanitización contra XSS
export function limpiarTexto(texto) {
    if (texto === null || texto === undefined) return "";
    return texto.toString()
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
