// Avance: Carga diferida de imágenes (Lazy Loading) con fade-in y respaldo si falla
let observer = null;

function cargar(img) {
    const src = img.dataset.src;
    if (!src) return;
    img.onload = () => img.classList.add('cargada');
    img.onerror = () => {
        img.onerror = null;
        if (img.dataset.fallback) img.src = img.dataset.fallback;
        img.classList.add('cargada');
    };
    img.src = src;
    img.removeAttribute('data-src');
}

export function inicializarLazyLoading(raiz = document) {
    const imagenes = raiz.querySelectorAll('img[data-src]');
    if (!('IntersectionObserver' in window)) { imagenes.forEach(cargar); return; }
    if (!observer) {
        observer = new IntersectionObserver((entradas, obs) => {
            entradas.forEach(e => {
                if (e.isIntersecting) { cargar(e.target); obs.unobserve(e.target); }
            });
        }, { rootMargin: '200px' });
    }
    imagenes.forEach(img => observer.observe(img));
}
