// Avance: Zoom estilo Mercado Libre (lupa sobre la imagen + panel ampliado). En táctil: tap para ampliar y arrastrar.
export function activarZoom({ wrap, img, lens, pane, hint }) {
    const Z = 2.6;
    const tactil = window.matchMedia('(hover: none)').matches;
    if (hint) hint.textContent = tactil ? '👆 Toca para ampliar' : '🔍 Pasa el mouse para ampliar';
    let activo = false;

    function mover(cx, cy) {
        const r = wrap.getBoundingClientRect();
        const lw = pane.clientWidth / Z, lh = pane.clientHeight / Z;
        lens.style.width = lw + 'px'; lens.style.height = lh + 'px';
        let x = Math.min(Math.max(cx - r.left - lw / 2, 0), r.width - lw);
        let y = Math.min(Math.max(cy - r.top - lh / 2, 0), r.height - lh);
        lens.style.left = x + 'px'; lens.style.top = y + 'px';
        pane.style.backgroundImage = `url("${img.src}")`;
        pane.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
        pane.style.backgroundPosition = `-${x * Z}px -${y * Z}px`;
    }
    function mostrar(v) { lens.style.display = pane.style.display = v ? 'block' : 'none'; }

    if (!tactil) {
        wrap.addEventListener('mouseenter', () => { mostrar(true); });
        wrap.addEventListener('mouseleave', () => mostrar(false));
        wrap.addEventListener('mousemove', e => mover(e.clientX, e.clientY));
    } else {
        const origen = (t) => {
            const r = wrap.getBoundingClientRect();
            img.style.transformOrigin = `${((t.clientX - r.left) / r.width) * 100}% ${((t.clientY - r.top) / r.height) * 100}%`;
        };
        wrap.addEventListener('click', e => {
            activo = !activo;
            if (activo) { origen(e); img.style.transform = 'scale(2.4)'; } else img.style.transform = 'scale(1)';
        });
        wrap.addEventListener('touchmove', e => { if (activo) { e.preventDefault(); origen(e.touches[0]); } }, { passive: false });
    }
    return { reset() { activo = false; img.style.transform = 'scale(1)'; mostrar(false); } };
}
