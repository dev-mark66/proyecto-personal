import { arrancar } from '../core/main.js';
import { cargarProductos, getProductos, getFavs, toggleFav, getCarrusel } from '../core/almacen.js';
import { LIGAS, WHATSAPP, iconoLiga } from '../core/config.js';
import { fmtBs, imgFallback } from '../core/utils.js';
import { normalizarImagen } from '../avances/dropbox.js';
import { limpiarTexto as L } from '../avances/seguridad-xss.js';
import { inicializarLazyLoading } from '../avances/lazy-loading.js';
import { configurarDelegacionEventos as deleg } from '../avances/delegacion-eventos.js';
import { toast } from '../avances/alertas.js';
import { validarFormulario, validacionEnVivo, limpiarValidacion } from '../avances/validaciones.js';
import { activarZoom } from '../avances/zoom.js';
import { observarReveal, lluviaBalones, animarContador } from '../avances/animaciones.js';

const $ = id => document.getElementById(id);
const est = { liga: 'todas', q: '', orden: 'nuevo', disp: false, id: null, talla: null };
let productos = [], zoom = null;
const src = p => normalizarImagen(p.imagen) || imgFallback(p.titulo);

function tarjeta(p) {
    const fav = getFavs().includes(p.id);
    const rib = p.stock <= 0 ? '<span class="p-ribbon agot">AGOTADO</span>' : p.stock <= 3 ? '<span class="p-ribbon ult">ÚLTIMAS</span>' : (Date.now() - p.id < 6048e5 ? '<span class="p-ribbon nuevo">NUEVO</span>' : '');
    return `<div class="col-6 col-md-4 col-xl-3 reveal"><article class="p-card tilt" data-id="${p.id}">
      <div class="p-img js-zoom">${rib}<img alt="${L(p.titulo)}" data-src="${L(src(p))}" data-fallback="${L(imgFallback(p.titulo))}">
        <div class="p-lupa"><i class="fa-solid fa-magnifying-glass-plus"></i> Ver y ampliar</div></div>
      <button class="p-fav js-fav ${fav ? 'on' : ''}" aria-label="Favorito"><i class="${fav ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
      <div class="p-body js-zoom"><div class="p-liga">${iconoLiga(p.liga, 18)} ${L(LIGAS[p.liga]?.n || p.liga)} · ${L(p.temporada)}</div>
        <div class="p-title">${L(p.titulo)}</div><div>${p.tallas.map(t => `<span class="badge-talla">${L(t)}</span>`).join('')}</div>
        <div class="d-flex justify-content-between align-items-end mt-2"><span class="p-precio">${fmtBs(p.precio)}</span>
        <small class="t-m"><i class="fa-solid fa-cubes"></i> ${p.stock}</small></div></div></article></div>`;
}
const pintar = (id, lista, vacio) => {
    const c = $(id); if (!c) return;
    c.innerHTML = lista.length ? lista.map(tarjeta).join('') : `<div class="col-12 text-center t-m py-5"><div style="font-size:3rem">⚽</div><h5>${vacio}</h5></div>`;
    inicializarLazyLoading(c); observarReveal(c);
};

function renderCarrusel() {
    const s = getCarrusel();
    $('heroCarrusel').innerHTML = `<div id="carouselBanner" class="carousel slide carousel-fade hero">
      <div class="carousel-indicators">${s.map((_, i) => `<button type="button" data-bs-target="#carouselBanner" data-bs-slide-to="${i}" class="${i ? '' : 'active'}"></button>`).join('')}</div>
      <div class="carousel-inner">${s.map((x, i) => { const im = normalizarImagen(x.img); return `<div class="carousel-item ${i ? '' : 'active'}"><div class="hero-slide">
        ${im ? `<div class="bgimg" style="background-image:url('${L(im)}')"></div>` : ''}
        <div class="hero-cap"><span class="badge rounded-pill px-3 py-2 mb-3" style="background:#00ff66;color:#021208">${L(x.badge || 'ELITE SPORT')}</span>
        <h1>${L(x.titulo)}</h1><p class="fs-5 opacity-75">${L(x.texto || '')}</p>
        <button class="btn btn-neon px-4" data-vista="catalogo">Ver catálogo <i class="fa-solid fa-arrow-right ms-2"></i></button></div></div></div>`; }).join('')}</div>
      <button class="carousel-control-prev" data-bs-target="#carouselBanner" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
      <button class="carousel-control-next" data-bs-target="#carouselBanner" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button></div>`;
    new bootstrap.Carousel($('carouselBanner'), { interval: 5000, ride: 'carousel', touch: true });
}

function renderLigas() {
    const k = Object.keys(LIGAS);
    $('gridLigas').innerHTML = k.map(x => `<div class="col-6 col-md-4 col-lg reveal"><div class="cat-card" data-liga="${x}"><div class="lg">${iconoLiga(x, 60)}</div><h6>${LIGAS[x].n}</h6></div></div>`).join('')
      + `<div class="col-6 col-md-4 col-lg reveal"><div class="cat-card" data-liga="todas"><div class="lg">🏆</div><h6>Ver todo</h6></div></div>`;
    observarReveal($('gridLigas'));
}
function renderChips() {
    $('chipsLigas').innerHTML = [['todas', 'Todas'], ...Object.entries(LIGAS).map(([k, v]) => [k, v.n])]
      .map(([k, n]) => `<div class="chip ${est.liga === k ? 'active' : ''}" data-liga="${k}">${n}</div>`).join('');
}
function renderCatalogo() {
    let l = productos.filter(p => (est.liga === 'todas' || p.liga === est.liga) && p.titulo.toLowerCase().includes(est.q) && (!est.disp || p.stock > 0));
    if (est.orden === 'precio-asc') l.sort((a, b) => a.precio - b.precio);
    else if (est.orden === 'precio-desc') l.sort((a, b) => b.precio - a.precio);
    else l.sort((a, b) => b.id - a.id);
    $('contadorRes').textContent = `${l.length} producto${l.length === 1 ? '' : 's'}`;
    renderChips(); pintar('contenedorCliente', l, 'No se encontraron productos');
}
const renderFavs = () => { pintar('contenedorFavoritos', productos.filter(p => getFavs().includes(p.id)), 'Aún no tienes favoritos'); badges(); };
function badges() { const n = getFavs().length; document.querySelectorAll('.js-fav-count').forEach(b => { b.textContent = n; b.classList.toggle('d-none', !n); }); }

function renderHome() {
    pintar('contenedorDestacados', [...productos].sort((a, b) => b.id - a.id).slice(0, 4), 'Pronto nuevos productos');
    animarContador($('stProd'), productos.length); animarContador($('stLigas'), Object.keys(LIGAS).length);
    animarContador($('stOrig'), 100); animarContador($('stEnv'), 9);
}

window.cambiarVista = function (v) {
    document.querySelectorAll('.app-view').forEach(x => x.classList.remove('active'));
    $('vista-' + v)?.classList.add('active');
    document.querySelectorAll('[data-vista]').forEach(a => a.classList.toggle('active', a.dataset.vista === v && (a.classList.contains('nav-pill') || a.closest('.bottom-nav'))));
    if (v === 'favoritos') renderFavs(); if (v === 'catalogo') renderCatalogo();
    window.scrollTo({ top: 0, behavior: 'smooth' }); observarReveal();
};
window.filtrarPorLiga = l => { est.liga = l; cambiarVista('catalogo'); };

// ===== Zoom / detalle =====
function pintarFavBtn() {
    const on = getFavs().includes(est.id), b = $('btnFavorito');
    b.innerHTML = `<i class="${on ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${on ? 'En favoritos' : 'Añadir a favoritos'}`;
    b.classList.toggle('btn-danger', on); b.classList.toggle('btn-outline-danger', !on);
}
function abrir(id) {
    const p = productos.find(x => x.id === id); if (!p) return;
    est.id = id; est.talla = null;
    const im = $('zoomImg'); im.src = src(p); im.onerror = () => { im.onerror = null; im.src = imgFallback(p.titulo); };
    $('zoomLiga').innerHTML = `${iconoLiga(p.liga, 24)} ${L(LIGAS[p.liga]?.n || p.liga)}`;
    $('zoomTitulo').textContent = p.titulo; $('zoomTemporada').textContent = 'Temporada ' + p.temporada;
    $('zoomPrecio').textContent = fmtBs(p.precio); $('zoomDesc').textContent = p.descripcion || 'Camiseta oficial de alta calidad.';
    $('zoomStock').innerHTML = p.stock <= 0 ? '<span class="text-danger fw-bold">Agotado</span>' : `<span class="t-g fw-bold">${p.stock} disponibles</span>`;
    $('zoomTallas').innerHTML = p.tallas.map(t => `<button class="talla-opt" data-t="${L(t)}">${L(t)}</button>`).join(' ');
    $('btnComprar').disabled = p.stock <= 0; pintarFavBtn();
    $('modalZoom').classList.add('on'); document.body.classList.add('no-scroll');
}
window.cerrarZoom = () => { $('modalZoom').classList.remove('on'); document.body.classList.remove('no-scroll'); zoom?.reset(); };
window.contactarWhatsApp = () => {
    const p = productos.find(x => x.id === est.id); if (!p) return;
    if (!est.talla) { toast('Selecciona una talla primero', 'warn'); $('zoomTallas').classList.add('shake'); setTimeout(() => $('zoomTallas').classList.remove('shake'), 500); return; }
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Elite Sport, me interesa: ${p.titulo} (${p.temporada}) - Talla ${est.talla} - ${fmtBs(p.precio)}`)}`, '_blank');
};
window.compartir = async () => {
    const p = productos.find(x => x.id === est.id); const d = { title: p.titulo, text: `${p.titulo} - ${fmtBs(p.precio)} en Elite Sport`, url: location.href };
    try { navigator.share ? await navigator.share(d) : (await navigator.clipboard.writeText(`${d.text} ${d.url}`), toast('Enlace copiado', 'info')); } catch { /* cancelado */ }
};
function favorito(id, e) {
    const on = toggleFav(id);
    document.querySelectorAll(`[data-id="${id}"] .js-fav`).forEach(b => { b.classList.toggle('on', on); b.innerHTML = `<i class="${on ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`; });
    if (on && e) lluviaBalones(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    toast(on ? 'Añadido a favoritos ❤️' : 'Quitado de favoritos', on ? 'ok' : 'info');
    badges(); if ($('vista-favoritos').classList.contains('active')) renderFavs(); if (est.id === id) pintarFavBtn();
}

// ===== Perfil =====
window.ocultarModal = id => bootstrap.Modal.getInstance($(id))?.hide();
window.cambiarFotoPerfil = ev => {
    const f = ev.target.files[0]; if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 1.5e6) return toast('Elige una imagen de máximo 1.5 MB', 'error');
    const r = new FileReader(); r.onload = () => { $('perfilFoto').src = r.result; try { localStorage.setItem('eliteFoto', r.result); } catch {} toast('Foto actualizada'); }; r.readAsDataURL(f);
};

// ===== Contacto =====
const reglasC = { cNombre: { req: 1, min: 3, max: 40 }, cTel: { req: 1, regex: /^[67]\d{7}$/, msg: 'Celular boliviano de 8 dígitos (ej. 71234567)' }, cMsg: { req: 1, min: 10, max: 300 } };

document.addEventListener('DOMContentLoaded', async () => {
    if (!arrancar('cliente')) return;
    productos = await cargarProductos();
    const f = localStorage.getItem('eliteFoto'); if (f) $('perfilFoto').src = f;
    renderCarrusel(); renderLigas(); renderHome(); renderCatalogo(); renderFavs();
    zoom = activarZoom({ wrap: $('zmWrap'), img: $('zoomImg'), lens: $('zmLens'), pane: $('zmPane'), hint: $('zmHint') });

    document.addEventListener('click', e => { const a = e.target.closest('[data-vista]'); if (a) { e.preventDefault(); cambiarVista(a.dataset.vista); } });
    for (const c of ['#contenedorCliente', '#contenedorFavoritos', '#contenedorDestacados']) {
        deleg(c, '.js-fav', 'click', (e, t) => { e.stopPropagation(); favorito(+t.closest('[data-id]').dataset.id, e); });
        deleg(c, '.js-zoom', 'click', (e, t) => abrir(+t.closest('[data-id]').dataset.id));
    }
    deleg('#gridLigas', '[data-liga]', 'click', (e, t) => filtrarPorLiga(t.dataset.liga));
    deleg('#chipsLigas', '[data-liga]', 'click', (e, t) => { est.liga = t.dataset.liga; renderCatalogo(); });
    deleg('#zoomTallas', '.talla-opt', 'click', (e, t) => { est.talla = t.dataset.t; document.querySelectorAll('.talla-opt').forEach(x => x.classList.toggle('sel', x === t)); });
    $('modalZoom').addEventListener('click', e => { if (e.target.id === 'modalZoom') cerrarZoom(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarZoom(); });
    $('btnFavorito').onclick = e => favorito(est.id, e);

    const buscar = e => { est.q = e.target.value.toLowerCase().trim(); document.querySelectorAll('.js-buscar').forEach(i => i !== e.target && (i.value = e.target.value)); if (!$('vista-catalogo').classList.contains('active')) cambiarVista('catalogo'); else renderCatalogo(); };
    document.querySelectorAll('.js-buscar').forEach(i => i.addEventListener('input', buscar));
    $('filtroOrden').onchange = e => { est.orden = e.target.value; renderCatalogo(); };
    $('soloDisp').onchange = e => { est.disp = e.target.checked; renderCatalogo(); };

    const fc = $('formContacto'); validacionEnVivo(fc, reglasC);
    fc.addEventListener('submit', e => {
        e.preventDefault(); if (!validarFormulario(fc, reglasC, toast)) return;
        window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, soy ${$('cNombre').value} (${$('cTel').value}). ${$('cMsg').value}`)}`, '_blank');
        fc.reset(); limpiarValidacion(fc); toast('¡Mensaje listo! Te atenderemos pronto 💚');
    });
    toast('¡Bienvenido a Elite Sport! ⚽', 'info');
});
