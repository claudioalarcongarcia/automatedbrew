function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#bfbfbf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    const tanqueX = 410;
    const tanqueW = 280;
    const centroFermentadorX = tanqueX + tanqueW / 2;

    // Título enfatizado, sin cambiar el fondo
    ctx.save();
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(0,0,0,0.65)";
    ctx.lineWidth = 5;
    ctx.strokeText("Automated Brew", centroFermentadorX, 72);

    ctx.fillStyle = "#ffd739";
    ctx.fillText("Automated Brew", centroFermentadorX, 72);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("Automated Brew", centroFermentadorX + 1, 70);

    ctx.restore();

    const estadoW = 280;
    const estadoH = 40;
    const estadoX = Math.round(centroFermentadorX - estadoW / 2);
    const estadoY = 100;

    rectSombra(estadoX, estadoY, estadoW, estadoH, "#222", "#111", 4);

    textoPixel(
        !horarioTrabajoActivo && !juegoTerminado
            ? "Sin operador disponible"
            : "Operador disponible",
        centroFermentadorX,
        estadoY + 26,
        "bold 14px monospace",
        "white",
        "center"
    );

    panelTrabajadores();
    panelAlimentacion();
    panelIndicadores();
    panelAccionesIzquierda();

    panelProcesoDerecha();
    panelResultadoDerecha();
    panelGabineteControl();
    panelProductoMesDerecha();

    dibujarTanque();

    if (juegoTerminado) {
        rectSombra(
            340,
            110,
            600,
            58,
            resultadoNetoConInversion_CLP >= metaVictoria_CLP ? "#1f7a1f" : "#b80d0d",
            "#111",
            4
        );

        textoPixel(
            mensajeFinalJuego,
            canvas.width / 2,
            148,
            "bold 18px monospace",
            "#fff",
            "center"
        );
    }
}

let acumuladorHoras = 0;
let ultimo = performance.now();

function loop(ahora) {
    let deltaRealSegundos = (ahora - ultimo) / 1000;
    ultimo = ahora;

    if (deltaRealSegundos > 0.1) {
        deltaRealSegundos = 0.1;
    }

    if (!pausado && !juegoTerminado) {
        actualizarCalendarioSimulacion();

        let factorTiempo = horarioTrabajoActivo ? 0.5 : 4.0;
        acumuladorHoras += deltaRealSegundos * horasPorSegundoReal * factorTiempo;

        while (acumuladorHoras >= dt) {
            actualizarModelo();
            acumuladorHoras -= dt;
        }
    }

    dibujar();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);