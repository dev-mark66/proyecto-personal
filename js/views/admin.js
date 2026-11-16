import { arrancar } from '../core/main.js';
import { cargarProductos, getProductos, setProductos, getCarrusel, setCarrusel, restablecerDemo } from '../core/almacen.js';
import { LIGAS, iconoLiga } from '../core/config.js';
import { fmtBs, imgFallback, descargar } from '../core/utils.js';
import { normalizarImagen } from '../avances/dropbox.js';
import { limpiarTexto as L } from '../avances/seguridad-xss.js';
import { inicializarLazyLoading } from '../avances/lazy-loading.js';
import { configurarDelegacionEventos as deleg } from '../avances/delegacion-eventos.js';
import { toast, confirmar } from '../avances/alertas.js';
import { validarFormulario, validacionEnVivo, limpiarValidacion } from '../avances/validaciones.js';
import { observarReveal, animarContador } from '../avances/animaciones.js';

const $ = id => document.getElementById(id);
const src = p => normalizarImagen(p.imagen) || imgFallback(p.titulo);
let editId = null;
const reglas = { prodTitulo: { req: 1, min: 3, max: 60 }, prodPrecio: { req: 1, numMin: 1, numMax: 9999 }, prodStock: { req: 1, numMin: 0, numMax: 9999 }, prodImagen: { req: 0 } };
const reglasC = { cUrl: { req: 1 }, cTitulo: { req: 1, min: 3, max: 40 } };

function inventario() {
    const q = $('adminBuscar').value.toLowerCase().trim(), lg = $('adminLiga').value;
    const l = getProductos().filter(p => p.titulo.toLowerCase().includes(q) && (lg === 'todas' || p.liga === lg));
    $('totalInv').textContent = l.length;
    $('contenedorAdmin').innerHTML = l.length ? l.map(p => `<div class="col-md-6 col-xl-4 mb-4 reveal"><div class="glass-card p-3 h-100" data-id="${p.id}">
      <div class="d-flex justify-content-between mb-2"><span class="small fw-bold text-uppercase d-flex gap-2 align-items-center">${iconoLiga(p.liga, 22)} ${L(p.liga)}</span><small class="t-m">${L(p.fechaCreacion || '')}</small></div>
      <div class="p-img js-ver rounded-3 mb-3" style="aspect-ratio:4/3"><img data-src="${L(src(p))}" data-fallback="${L(imgFallback(p.titulo))}" alt=""><div class="p-lupa">Ver detalle</div></div>
      <h6 class="fw-bold text-truncate mb-1">${L(p.titulo)}</h6><p class="t-m small text-truncate mb-2">${L(p.descripcion || 'Sin descripción')}</p>
      <div class="mb-2">${p.tallas.map(t => `<span class="badge-talla">${L(t)}</span>`).join('')}</div>
      <div class="d-flex justify-content-between align-items-center border-top pt-2 mb-3" style="border-color:var(--border)!important"><span class="p-precio">${fmtBs(p.precio)}</span>
        <span class="stock-ctl d-flex align-items-center gap-2"><button class="js-menos">−</button><b class="${p.stock > 5 ? 't-g' : 'text-danger'}">${p.stock}</b><button class="js-mas">+</button></span></div>
      <div class="d-flex gap-2"><button class="btn btn-ghost btn-sm w-100 js-edit"><i class="fa-solid fa-pen"></i> Editar</button><button class="btn btn-outline-danger btn-sm w-100 js-del"><i class="fa-solid fa-trash"></i> Eliminar</button></div></div></div>`).join('')
      : '<div class="col-12 text-center t-m py-5"><div style="font-size:3rem">📦</div><h5>No hay productos. ¡Crea el primero!</h5></div>';
    inicializarLazyLoading($('contenedorAdmin')); observarReveal($('contenedorAdmin'));
}

function estadisticas() {
    const l = getProductos(), uni = l.reduce((a, p) => a + p.stock, 0), val = l.reduce((a, p) => a + p.stock * p.precio, 0);
    const set = (id, v) => animarContador($(id), v);
    set('sProd', l.length); set('sUni', uni); set('sVal', val); set('sBajo', l.filter(p => p.stock <= 5).length);
    const max = Math.max(1, ...Object.keys(LIGAS).map(k => l.filter(p => p.liga === k).length));
    $('barrasLigas').innerHTML = Object.entries(LIGAS).map(([k, v]) => { const n = l.filter(p => p.liga === k).length;
      return `<div class="mb-3"><div class="d-flex justify-content-between small mb-1"><span>${iconoLiga(k, 18)} ${v.n}</span><b>${n}</b></div><div class="barra"><i data-w="${n / max * 100}"></i></div></div>`; }).join('');
    setTimeout(() => document.querySelectorAll('#barrasLigas i').forEach(i => i.style.width = i.dataset.w + '%'), 80);
    const bajos = l.filter(p => p.stock <= 5);
    $('listaBajo').innerHTML = bajos.length ? bajos.map(p => `<li class="d-flex justify-content-between py-2 border-bottom" style="border-color:var(--border)!important"><span>${L(p.titulo)}</span><b class="text-danger">${p.stock}</b></li>`).join('') : '<li class="t-m">Todo el stock está saludable ✅</li>';
}

function carrusel() {
    $('listaCarrusel').innerHTML = getCarrusel().map((c, i) => `<div class="d-flex gap-3 align-items-center py-2 border-bottom" style="border-color:var(--border)!important">
      <div class="rounded-3" style="width:80px;height:50px;background:#04361a center/cover url('${L(normalizarImagen(c.img))}')"></div>
      <div class="flex-grow-1"><b>${L(c.titulo)}</b><div class="small t-m">${L(c.badge || '')}</div></div><button class="btn btn-outline-danger btn-sm js-delslide" data-i="${i}"><i class="fa-solid fa-trash"></i></button></div>`).join('');
}

window.cambiarVista = v => {
    document.querySelectorAll('.app-view').forEach(x => x.classList.toggle('active', x.id === 'vista-' + v));
    document.querySelectorAll('[data-vista]').forEach(a => a.classList.toggle('active', a.dataset.vista === v));
    bootstrap.Offcanvas.getInstance($('menuLateral'))?.hide();
    if (v === 'estadisticas') estadisticas(); if (v === 'config') carrusel(); if (v === 'inventario') inventario();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function reset() {
    editId = null; $('formProducto').reset(); limpiarValidacion($('formProducto')); $('prodPreview').innerHTML = 'Vista previa';
    $('tituloForm').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Nuevo producto'; $('btnGuardar').textContent = 'GUARDAR PRODUCTO'; $('btnCancelar').classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!arrancar('admin')) return;
    await cargarProductos(); inventario();
    $('prodLiga').innerHTML = Object.entries(LIGAS).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('');
    $('adminLiga').innerHTML = '<option value="todas">Todas las ligas</option>' + $('prodLiga').innerHTML;
    document.addEventListener('click', e => { const a = e.target.closest('[data-vista]'); if (a) { e.preventDefault(); cambiarVista(a.dataset.vista); } });
    $('adminBuscar').oninput = inventario; $('adminLiga').onchange = inventario;
    const f = $('formProducto'); validacionEnVivo(f, reglas);
    $('prodImagen').addEventListener('input', e => { const u = normalizarImagen(e.target.value); $('prodPreview').innerHTML = u ? `<img src="${L(u)}" alt="" onerror="this.parentElement.textContent='⚠️ No se pudo cargar la imagen'">` : 'Vista previa'; });
    $('btnCancelar').onclick = reset;

    f.addEventListener('submit', e => {
        e.preventDefault(); if (!validarFormulario(f, reglas, toast)) return;
        const tallas = [...document.querySelectorAll('.talla-check:checked')].map(c => c.value);
        if (!tallas.length) return toast('Selecciona al menos una talla', 'warn');
        const raw = $('prodImagen').value.trim(); if (raw && !normalizarImagen(raw)) return toast('El enlace de imagen no es válido (usa https://)', 'error');
        const d = { titulo: $('prodTitulo').value.trim(), precio: +$('prodPrecio').value, stock: +$('prodStock').value, liga: $('prodLiga').value, temporada: $('prodTemporada').value, descripcion: $('prodDesc').value.trim(), tallas, imagen: raw };
        const l = getProductos();
        if (editId) { const i = l.findIndex(p => p.id === editId); l[i] = { ...l[i], ...d }; toast('Producto actualizado ✏️'); }
        else { l.unshift({ id: Date.now(), ...d, fechaCreacion: new Date().toLocaleDateString('es-BO') }); toast('¡Producto registrado exitosamente! ✅'); }
        setProductos(l); reset(); inventario();
    });

    deleg('#contenedorAdmin', '.js-del', 'click', async (e, t) => {
        const id = +t.closest('[data-id]').dataset.id;
        if (await confirmar('Esta acción no se puede deshacer.', { titulo: 'Eliminar producto', icono: '🗑️', ok: 'Eliminar' })) { setProductos(getProductos().filter(p => p.id !== id)); inventario(); toast('Producto eliminado', 'info'); }
    });
    deleg('#contenedorAdmin', '.js-mas,.js-menos', 'click', (e, t) => {
        const id = +t.closest('[data-id]').dataset.id, l = getProductos(), p = l.find(x => x.id === id);
        p.stock = Math.max(0, p.stock + (t.classList.contains('js-mas') ? 1 : -1)); setProductos(l); inventario();
    });
    deleg('#contenedorAdmin', '.js-edit', 'click', (e, t) => {
        const p = getProductos().find(x => x.id === +t.closest('[data-id]').dataset.id); editId = p.id;
        $('prodTitulo').value = p.titulo; $('prodPrecio').value = p.precio; $('prodStock').value = p.stock; $('prodLiga').value = p.liga; $('prodTemporada').value = p.temporada; $('prodImagen').value = p.imagen || ''; $('prodDesc').value = p.descripcion || '';
        document.querySelectorAll('.talla-check').forEach(c => c.checked = p.tallas.includes(c.value)); $('prodImagen').dispatchEvent(new Event('input'));
        $('tituloForm').innerHTML = '<i class="fa-solid fa-pen"></i> Editando producto'; $('btnGuardar').textContent = 'ACTUALIZAR PRODUCTO'; $('btnCancelar').classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' }); toast('Modo edición activado', 'info');
    });
    deleg('#contenedorAdmin', '.js-ver', 'click', (e, t) => {
        const p = getProductos().find(x => x.id === +t.closest('[data-id]').dataset.id);
        $('imgAdminGrande').src = src(p); $('modalTitulo').textContent = p.titulo; $('modalPrecio').textContent = fmtBs(p.precio); $('modalDesc').textContent = p.descripcion || 'Sin descripción';
        $('modalLiga').innerHTML = iconoLiga(p.liga, 26) + ' ' + L(LIGAS[p.liga]?.n); $('modalTallas').innerHTML = p.tallas.map(x => `<span class="badge-talla fs-6">${L(x)}</span>`).join('');
        new bootstrap.Modal($('modalImagenAdmin')).show();
    });

    // Configuración
    const fc = $('formCarrusel'); validacionEnVivo(fc, reglasC);
    fc.addEventListener('submit', e => {
        e.preventDefault(); if (!validarFormulario(fc, reglasC, toast)) return;
        if (!normalizarImagen($('cUrl').value)) return toast('Enlace de imagen no válido', 'error');
        const c = getCarrusel(); c.push({ img: $('cUrl').value.trim(), titulo: $('cTitulo').value.trim(), badge: $('cBadge').value.trim(), texto: $('cTexto').value.trim() });
        setCarrusel(c); fc.reset(); limpiarValidacion(fc); carrusel(); toast('Slide agregado al carrusel 🎠');
    });
    deleg('#listaCarrusel', '.js-delslide', 'click', (e, t) => { const c = getCarrusel(); if (c.length <= 1) return toast('Debe quedar al menos un slide', 'warn'); c.splice(+t.dataset.i, 1); setCarrusel(c); carrusel(); toast('Slide eliminado', 'info'); });
    $('btnExportar').onclick = () => { descargar('productos-elite.json', JSON.stringify(getProductos(), null, 2)); toast('Inventario exportado 📥'); };
    $('btnReset').onclick = async () => { if (await confirmar('Se borrarán productos, favoritos y carrusel personalizados.', { titulo: 'Restablecer demo', icono: '♻️', ok: 'Restablecer' })) { restablecerDemo(); location.reload(); } };
});
