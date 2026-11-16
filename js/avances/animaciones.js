// Avance: Animaciones y efectos (fondo de estadio, balones, reveal, tilt, ripple, contadores)
let io = null;

function crearFondo() {
    if (document.querySelector('.bg-stadium')) return;
    const f = document.createElement('div');
    f.innerHTML = `<div class="bg-stadium"></div><div class="bg-pitch"></div><div class="bg-vignette"></div>
        <div class="bg-balls"></div>
        <div class="bg-runner"><span class="rn-player">🏃‍♂️</span><span class="rn-ball">⚽</span></div>
        <div id="splash"><div class="sb">⚽</div><p>ELITE SPORT</p></div>`;
    while (f.firstChild) document.body.prepend(f.lastChild);
    const balls = document.querySelector('.bg-balls');
    const iconos = ['⚽', '⚽', '🥅', '🏆', '👟', '⚽'];
    for (let i = 0; i < 9; i++) {
        const s = document.createElement('span');
        s.textContent = iconos[i % iconos.length];
        s.style.left = Math.random() * 95 + '%';
        s.style.fontSize = 16 + Math.random() * 30 + 'px';
        s.style.animationDuration = 14 + Math.random() * 18 + 's';
        s.style.animationDelay = -Math.random() * 25 + 's';
        balls.appendChild(s);
    }
}

export function observarReveal(raiz = document) {
    const els = raiz.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    if (!io) io = new IntersectionObserver((en, o) => en.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
    }), { threshold: .08 });
    els.forEach((e, i) => { e.style.transitionDelay = Math.min(i % 8, 7) * 60 + 'ms'; io.observe(e); });
}

export function lluviaBalones(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
        const b = document.createElement('span');
        b.className = 'mini-ball'; b.textContent = '⚽';
        b.style.left = x + 'px'; b.style.top = y + 'px';
        b.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
        b.style.setProperty('--dy', (-60 - Math.random() * 140) + 'px');
        document.body.appendChild(b);
        setTimeout(() => b.remove(), 900);
    }
}

export function animarContador(el, fin, dur = 1200) {
    const sufijo = el.dataset.suffix || '';
    const t0 = performance.now();
    (function paso(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))) + sufijo;
        if (p < 1) requestAnimationFrame(paso);
    })(t0);
}

export function inicializarAnimaciones() {
    crearFondo();
    observarReveal();
    // Ripple en botones, chips y pills
    document.addEventListener('click', e => {
        const b = e.target.closest('.btn,.chip,.nav-pill');
        if (!b) return;
        const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
        const o = document.createElement('span');
        o.className = 'ripple';
        o.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
        b.appendChild(o); setTimeout(() => o.remove(), 600);
    });
    // Efecto 3D (tilt) solo con mouse
    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', e => {
            const c = e.target.closest?.('.tilt'); if (!c) return;
            const r = c.getBoundingClientRect();
            c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
            c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 10 + 'deg');
        });
        document.addEventListener('mouseout', e => {
            const c = e.target.closest?.('.tilt');
            if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
        });
    }
}
