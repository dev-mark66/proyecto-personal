// Utilidades compartidas
export const fmtBs = n => 'Bs. ' + Number(n || 0).toLocaleString('es-BO');

// Camiseta SVG generada cuando un producto no tiene imagen (o falla el enlace)
export function imgFallback(titulo = '') {
    const ini = (titulo.match(/[A-Za-zÁ-ú0-9]/g) || ['E', 'S']).slice(0, 2).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00ff66"/><stop offset="1" stop-color="#007a30"/></linearGradient></defs><rect width="400" height="400" fill="#071109"/><path d="M130 60l-80 50 35 60 35-20v170h160V150l35 20 35-60-80-50c-10 25-35 40-70 40s-60-15-70-40z" fill="url(#g)" stroke="#fff" stroke-width="4"/><text x="200" y="255" font-size="70" font-family="Arial" font-weight="900" text-anchor="middle" fill="#021208">${ini}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function descargar(nombre, texto) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    a.download = nombre; a.click(); URL.revokeObjectURL(a.href);
}
