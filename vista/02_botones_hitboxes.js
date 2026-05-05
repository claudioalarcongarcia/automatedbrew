function marcarBotonPresionado(nombre) {
    botonPresionadoTemporal = nombre;
    tiempoBotonPresionado = performance.now();
}

function botonEstaPresionado(nombre) {
    return botonPresionadoTemporal === nombre && performance.now() - tiempoBotonPresionado < 180;
}

function agregarHitbox(x, y, w, h, accion, nombre = "") {
    hitboxes.push({ x, y, w, h, accion, nombre });
}

canvas.addEventListener("click", function(evento) {
    const rect = canvas.getBoundingClientRect();

    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;

    const x = (evento.clientX - rect.left) * escalaX;
    const y = (evento.clientY - rect.top) * escalaY;

    for (let i = hitboxes.length - 1; i >= 0; i--) {
        const b = hitboxes[i];

        if (
            x >= b.x &&
            x <= b.x + b.w &&
            y >= b.y &&
            y <= b.y + b.h
        ) {
            marcarBotonPresionado(b.nombre);
            b.accion();
            return;
        }
    }
});

canvas.addEventListener("mousemove", function(evento) {
    const rect = canvas.getBoundingClientRect();

    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;

    const x = (evento.clientX - rect.left) * escalaX;
    const y = (evento.clientY - rect.top) * escalaY;

    let sobreBoton = false;

    for (let i = hitboxes.length - 1; i >= 0; i--) {
        const b = hitboxes[i];

        if (
            x >= b.x &&
            x <= b.x + b.w &&
            y >= b.y &&
            y <= b.y + b.h
        ) {
            sobreBoton = true;
            break;
        }
    }

    canvas.style.cursor = sobreBoton ? "pointer" : "default";
});

function botonCanvas(x, y, w, h, textoBtn, color, accion, font = "bold 11px monospace") {
    const nombre = textoBtn + "_" + x + "_" + y;
    const presionado = botonEstaPresionado(nombre);

    const dx = presionado ? 3 : 0;
    const dy = presionado ? 3 : 0;

    if (presionado) {
        rectPixel(x + dx, y + dy, w, h, color, "#111", 3);

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(x + dx + 4, y + dy + 4, w - 8, h - 8);

        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(x + dx + 4, y + dy + h - 8, w - 8, 4);
    } else {
        rectSombra(x, y, w, h, color, "#111", 3);
    }

    const lineas = textoBtn.split("\n");

    for (let i = 0; i < lineas.length; i++) {
        textoPixel(
            lineas[i],
            x + w / 2 + dx,
            y + 18 + i * 13 + dy,
            font,
            "#fff",
            "center"
        );
    }

    agregarHitbox(x, y, w, h, accion, nombre);
}