// Avance: Validaciones de formularios con mensajes visuales
function marcar(input, msg) {
    input.classList.toggle('is-invalid', !!msg);
    input.classList.toggle('is-valid', !msg && input.value.trim() !== '');
    let fb = input.parentElement.querySelector(':scope > .invalid-feedback.auto');
    if (msg) {
        if (!fb) { fb = document.createElement('div'); fb.className = 'invalid-feedback auto'; input.insertAdjacentElement('afterend', fb); }
        fb.textContent = msg;
    } else if (fb) fb.remove();
}

export function validarCampo(input, r = {}) {
    const v = input.value.trim();
    let m = '';
    if (r.req && !v) m = 'Este campo es obligatorio';
    else if (v) {
        if (r.min && v.length < r.min) m = `Mínimo ${r.min} caracteres`;
        else if (r.max && v.length > r.max) m = `Máximo ${r.max} caracteres`;
        else if (r.regex && !r.regex.test(v)) m = r.msg || 'Formato inválido';
        else if (r.numMin !== undefined && !(Number(v) >= r.numMin)) m = `Debe ser ${r.numMin} o más`;
        else if (r.numMax !== undefined && Number(v) > r.numMax) m = `No puede superar ${r.numMax}`;
    }
    marcar(input, m);
    return !m;
}

export function validarFormulario(form, reglas, aviso) {
    let ok = true, primero = null;
    for (const [id, r] of Object.entries(reglas)) {
        const el = form.querySelector('#' + id);
        if (el && !validarCampo(el, r)) { ok = false; primero = primero || el; }
    }
    if (!ok) {
        primero.focus();
        form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
        aviso && aviso('Revisa los campos marcados en rojo', 'error');
    }
    return ok;
}

export function validacionEnVivo(form, reglas) {
    Object.entries(reglas).forEach(([id, r]) => {
        const el = form.querySelector('#' + id);
        if (el) el.addEventListener('input', () => validarCampo(el, r));
    });
}

export function limpiarValidacion(form) {
    form.querySelectorAll('.is-valid,.is-invalid').forEach(e => e.classList.remove('is-valid', 'is-invalid'));
    form.querySelectorAll('.invalid-feedback.auto').forEach(e => e.remove());
}
