// Avance: Hidratación de la interfaz (quita el splash y activa las animaciones)
export function iniciarHidratacion() {
    console.log("💧 Iniciando hidratación de la interfaz...");
    const listo = () => {
        document.body.classList.add('hidratado');
        console.log("✅ Interfaz hidratada correctamente.");
    };
    setTimeout(listo, 700);
}
