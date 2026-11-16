// Configuración global de Elite Sport
export const WHATSAPP = '59170000000';
export const ADMIN_PASS = 'admin123';
export const TEMPORADAS = ['2024/25', '2025/26', '2026/27', 'Retro'];

export const LIGAS = {
    laliga:     { n: 'La Liga',        e: '🇪🇸', logo: '../assets/img/ligas/laliga.png' },
    premier:    { n: 'Premier League', e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: '../assets/img/ligas/premier.png' },
    seriea:     { n: 'Serie A',        e: '🇮🇹', logo: '../assets/img/ligas/seriea.png' },
    bundesliga: { n: 'Bundesliga',     e: '🇩🇪', logo: '../assets/img/ligas/bundesliga.png' },
    argentina:  { n: 'Liga Argentina', e: '🇦🇷', logo: '../assets/img/ligas/argentina.png' }
};

// Logo de liga; si no existe el archivo, muestra el emoji de la bandera
export function iconoLiga(k, px = 20) {
    const l = LIGAS[k] || LIGAS.laliga;
    return `<img src="${l.logo}" width="${px}" height="${px}" alt="" onerror="this.outerHTML='<span>${l.e}</span>'">`;
}

// Slides por defecto. Reemplaza "img" por enlaces de Dropbox o usa el panel Admin > Configuración.
export const CARRUSEL_DEFECTO = [
    { img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop', badge: 'NUEVA COLECCIÓN', titulo: 'Temporada 2026/27', texto: 'Siente la pasión del fútbol con la mejor calidad.' },
    { img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2000&auto=format&fit=crop', badge: 'OFERTA', titulo: 'Hasta 30% Off', texto: 'Solo por tiempo limitado en camisetas seleccionadas.' },
    { img: '', badge: 'ENVÍOS', titulo: 'Llegamos a todo Bolivia', texto: 'Compra por WhatsApp y recibe en tu puerta.' }
];
