const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

let hitboxes = [];
let botonPresionadoTemporal = null;
let tiempoBotonPresionado = 0;

function clp(valor) {
    return Math.round(valor).toLocaleString("es-CL");
}

function redondear(v, n = 1) {
    return Number(v).toFixed(n);
}