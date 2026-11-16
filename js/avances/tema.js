// Avance: Cambio de Tema (Dark/Light Mode). También cambia el fondo del estadio vía CSS.
export function inicializarTema() {
    const body = document.body;
    const aplicar = (claro) => {
        body.classList.toggle('modo-claro', claro);
        document.documentElement.setAttribute('data-bs-theme', claro ? 'light' : 'dark');
        document.querySelectorAll('.js-tema-icon').forEach(i => {
            i.classList.toggle('fa-sun', claro);
            i.classList.toggle('fa-moon', !claro);
        });
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = claro ? '#eafbef' : '#030705';
    };

    aplicar(localStorage.getItem('eliteTema') === 'claro');

    window.toggleTema = window.toggleModo = function () {
        const cambiar = () => {
            const claro = !body.classList.contains('modo-claro');
            localStorage.setItem('eliteTema', claro ? 'claro' : 'oscuro');
            aplicar(claro);
        };
        // Transición suave nativa (2026) si el navegador la soporta
        if (document.startViewTransition) document.startViewTransition(cambiar);
        else cambiar();
    };
}
