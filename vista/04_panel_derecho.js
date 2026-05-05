// ======================================================
// CONFIGURACIÓN DE PANELES DERECHOS
// ======================================================

const panelDerechoX = 780;
const panelDerechoW = 470;

const panelProcesoY = 45;
const panelResultadoY = 199;
const panelGabineteY = 281;
const panelProductoMesY = 655;

// ======================================================
// FUNCIONES AUXILIARES PARA BOTONES DEL GABINETE
// ======================================================

function apagarControlTermico() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = false;
}

function calorMaximo() {
    if (!puedeOperar()) return;
    nivelCalor = 1;
}

function refrigeracionMaxima() {
    if (!puedeOperar()) return;
    nivelRefrigeracion = 1;
}

function apagarAireacion() {
    if (!puedeOperar()) return;
    A = 0;
}

function aireacionMaxima() {
    if (!puedeOperar()) return;
    A = 1;
}

function apagarAgitacion() {
    if (!puedeOperar()) return;
    G = 0;
}

function agitacionMaxima() {
    if (!puedeOperar()) return;
    G = 1;
}

// ======================================================
// PANELES DERECHOS
// ======================================================

function panelProcesoDerecha() {
    const x = panelDerechoX;
    const y = panelProcesoY;
    const w = panelDerechoW;
    const h = 145;

    marcoPanel(x, y, w, h, "INFORMACIÓN DEL PROCESO", "#0672d8", "#dff1ff", "i");

    const fontInterior = "bold 11px monospace";

    const x1 = x + 16;
    const x2 = x + 118;
    const x3 = x + 304;
    const x4 = x + 448;

    let yy = y + 55;
    const dy = 17;

    texto("Fecha", x1, yy, fontInterior);
    texto(textoFechaHora, x2, yy, fontInterior);
    texto("T baño", x3, yy, fontInterior);
    texto(redondear(Temp, 1) + " °C", x4, yy, fontInterior, "#111", "right");
    yy += dy;

    texto("Turno", x1, yy, fontInterior);
    texto(turnoActualTexto, x2, yy, fontInterior);
    texto("T amb", x3, yy, fontInterior);
    texto(redondear(Tamb, 1) + " °C", x4, yy, fontInterior, "#111", "right");
    yy += dy;

    texto("Operador", x1, yy, fontInterior);
    texto(tipoTrabajadorActualTexto, x2, yy, fontInterior);
    texto("Trabajo", x3, yy, fontInterior);
    texto(
        horarioTrabajoActivo ? "ON" : "OFF",
        x4,
        yy,
        fontInterior,
        horarioTrabajoActivo ? "#087a13" : "#c00020",
        "right"
    );
    yy += dy;

    texto("Velocidad", x1, yy, fontInterior);
    texto(horarioTrabajoActivo ? "x0.5" : "x4", x2, yy, fontInterior);
    texto("Volumen", x3, yy, fontInterior);
    texto(redondear(V, 1) + " L", x4, yy, fontInterior, "#111", "right");
    yy += dy;

    texto("Tiempo", x1, yy, fontInterior);
    texto(redondear(t, 1) + " h", x2, yy, fontInterior);
    texto("Meses", x3, yy, fontInterior);
    texto(redondear(t / 720, 3), x4, yy, fontInterior, "#111", "right");

    linea(x + 294, y + 48, x + 294, y + 130, "#5aa1dd", 2);
}

function panelResultadoDerecha() {
    const x = panelDerechoX;
    const y = panelResultadoY;
    const w = panelDerechoW;
    const h = 72;

    marcoPanel(x, y, w, h, "RESULTADO NETO", "#d90000", "#ffdede", "$");

    textoPixel(
        "$" + clp(resultadoNetoConInversion_CLP),
        x + w / 2,
        y + 60,
        "bold 24px monospace",
        resultadoNetoConInversion_CLP >= 0 ? "#087a13" : "#8b0000",
        "center"
    );
}

// ======================================================
// GABINETE DE CONTROL
// ======================================================

function botonMini(x, y, w, h, label, color, accion) {
    const nombre = label + "_" + x + "_" + y;
    const presionado = botonEstaPresionado(nombre);

    const dx = presionado ? 3 : 0;
    const dy = presionado ? 3 : 0;

    if (presionado) {
        rectPixel(x + dx, y + dy, w, h, color, "#111", 3);

        ctx.fillStyle = "rgba(0,0,0,0.20)";
        ctx.fillRect(x + dx + 4, y + dy + 4, w - 8, h - 8);
    } else {
        rectSombra(x, y, w, h, color, "#111", 3);
    }

    ctx.save();
    const esSimbolo = (label === "+" || label === "-");
    ctx.font = esSimbolo ? "bold 22px monospace" : "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = esSimbolo ? 4 : 2;
    ctx.lineJoin = "round";
    ctx.strokeText(label, x + w / 2 + dx, y + h / 2 + dy);

    ctx.fillStyle = "#fff";
    ctx.fillText(label, x + w / 2 + dx, y + h / 2 + dy);
    ctx.restore();

    agregarHitbox(x, y, w, h, accion, nombre);
}

function textoHalo(txt, x, y, font, colorTexto, align = "left", grosorHalo = 3) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.lineWidth = grosorHalo * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(txt, x, y);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillText(txt, x + 1, y + 1);

    ctx.fillStyle = colorTexto;
    ctx.fillText(txt, x, y);

    ctx.restore();
}

function filaGabinete(yFila, titulo, colorHeader, colorBody, botones) {
    const x = panelDerechoX + 12;
    const w = panelDerechoW - 24;
    const h = 34;

    rectPixel(x, yFila, w, h, colorBody, "#111", 3);

    rectSombra(x + 3, yFila + 3, 155, h - 6, colorHeader, "#111", 3);

    ctx.save();
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeText(titulo, x + 10, yFila + Math.round(h / 2) + 5);
    ctx.fillStyle = "#fff";
    ctx.fillText(titulo, x + 10, yFila + Math.round(h / 2) + 5);
    ctx.restore();

    const bx0 = x + 166;
    const bh = 24;
    const by = yFila + Math.round((h - bh) / 2);
    const bw = 66;
    const gap = 5;

    for (let i = 0; i < botones.length; i++) {
        botonMini(
            bx0 + i * (bw + gap),
            by,
            bw,
            bh,
            botones[i].texto,
            botones[i].color,
            botones[i].accion
        );
    }
}

function panelGabineteControl() {
    const x = panelDerechoX;
    const y = panelGabineteY;
    const w = panelDerechoW;
    const h = 365;

    marcoPanel(x, y, w, h, "GABINETE DE CONTROL", "#1f2933", "#dddddd", "");

    const y0 = y + 47;
    const paso = 34;

    // ======================================================
    // 1. SUSTRATO E INÓCULO
    // ======================================================

    const bx0Sus = x + 12 + 166;
    const bwSus = 66;
    const gapSus = 5;
    const bhSus = 24;

    // --- FILA 1: Inóculo ---
    const yF1 = y0;
    rectPixel(x + 12, yF1, w - 24, 34, "#eef6e8", "#111", 3);
    rectSombra(x + 15, yF1 + 3, 155, 28, "#0d8f20", "#111", 3);

    ctx.save();
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeText("INÓCULO", x + 24, yF1 + 22);
    ctx.fillStyle = "#fff";
    ctx.fillText("INÓCULO", x + 24, yF1 + 22);
    ctx.restore();

    botonMini(bx0Sus, yF1 + 5, bwSus * 2 + gapSus, bhSus, "Agregar levadura", "#6b2fb8", agregarLevaduraSeca);

    // --- FILA 2: Concentración de sustrato ---
    const yF2 = y0 + 34;
    rectPixel(x + 12, yF2, w - 24, 34, "#eef6e8", "#111", 3);
    rectSombra(x + 15, yF2 + 3, 155, 28, "#0d8f20", "#111", 3);

    ctx.save();
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeText("CONC. DE SUSTRATO", x + 24, yF2 + 22);
    ctx.fillStyle = "#fff";
    ctx.fillText("CONC. DE SUSTRATO", x + 24, yF2 + 22);
    ctx.restore();

    botonMini(bx0Sus, yF2 + 5, bwSus, bhSus, "-", "#1cb7ca", disminuirSustratoEntrada);
    botonMini(bx0Sus + bwSus + gapSus, yF2 + 5, bwSus, bhSus, "+", "#1cb7ca", aumentarSustratoEntrada);

    // ======================================================
    // 2. FLUJO ENTRADA ALIMENTACIÓN
    // ======================================================

    filaGabinete(
        y0 + 68,
        "ENTRADA ALIM.",
        "#0d8f20",
        "#e7f8e7",
        [
            { texto: "OFF", color: "#777", accion: cerrarAlimentacion },
            { texto: "-", color: "#35b943", accion: disminuirAlimentacion },
            { texto: "+", color: "#35b943", accion: aumentarAlimentacion },
            { texto: "MAX", color: "#35b943", accion: llenadoMaximo }
        ]
    );

    // ======================================================
    // 3. FLUJO SALIDA PRODUCTO
    // ======================================================

    filaGabinete(
        y0 + 68 + paso,
        "SALIDA PROD.",
        "#0b63b6",
        "#e1f1ff",
        [
            { texto: "OFF", color: "#777", accion: cerrarProducto },
            { texto: "-", color: "#338be8", accion: disminuirSalidaProducto },
            { texto: "+", color: "#338be8", accion: aumentarSalidaProducto },
            { texto: "MAX", color: "#338be8", accion: abrirProductoCompleto }
        ]
    );

    // ======================================================
    // 4. FLUJO SALIDA DESECHO
    // ======================================================

    filaGabinete(
        y0 + 68 + paso * 2,
        "SALIDA DESECHO",
        "#a20f18",
        "#ffe2e2",
        [
            { texto: "OFF", color: "#777", accion: cerrarDesecho },
            { texto: "-", color: "#c61b1b", accion: disminuirSalidaDesecho },
            { texto: "+", color: "#c61b1b", accion: aumentarSalidaDesecho },
            { texto: "MAX", color: "#c61b1b", accion: abrirDesechoCompleto }
        ]
    );

    // ======================================================
    // 5. CALOR
    // ======================================================

    filaGabinete(
        y0 + 68 + paso * 3,
        "CALOR",
        "#c76018",
        "#fff0df",
        [
            { texto: "OFF", color: "#777", accion: apagarCalor },
            { texto: "-", color: "#e58a32", accion: disminuirCalor },
            { texto: "+", color: "#e58a32", accion: aumentarCalor },
            { texto: "MAX", color: "#e58a32", accion: calorMaximo }
        ]
    );

    // ======================================================
    // 6. REFRIGERACIÓN
    // ======================================================

    filaGabinete(
        y0 + 68 + paso * 4,
        "REFRIG.",
        "#087d91",
        "#dff8ff",
        [
            { texto: "OFF", color: "#777", accion: apagarRefrigeracion },
            { texto: "-", color: "#1cb7ca", accion: disminuirRefrigeracion },
            { texto: "+", color: "#1cb7ca", accion: aumentarRefrigeracion },
            { texto: "MAX", color: "#1cb7ca", accion: refrigeracionMaxima }
        ]
    );

    // ======================================================
    // 7. AIREACIÓN
    // ======================================================

    filaGabinete(
        y0 + 68 + paso * 5,
        "AIREACIÓN",
        "#0b63b6",
        "#e1f1ff",
        [
            { texto: "OFF", color: "#777", accion: apagarAireacion },
            { texto: "-", color: "#338be8", accion: disminuirAireacion },
            { texto: "+", color: "#338be8", accion: aumentarAireacion },
            { texto: "MAX", color: "#338be8", accion: aireacionMaxima }
        ]
    );

    // ======================================================
    // 8. AGITACIÓN
    // ======================================================

    filaGabinete(
        y0 + 68 + paso * 6,
        "AGITACIÓN",
        "#b8860b",
        "#fff4d6",
        [
            { texto: "OFF", color: "#777", accion: apagarAgitacion },
            { texto: "-", color: "#d9a823", accion: disminuirAgitacion },
            { texto: "+", color: "#d9a823", accion: aumentarAgitacion },
            { texto: "MAX", color: "#d9a823", accion: agitacionMaxima }
        ]
    );
}

function panelProductoMesDerecha() {
    const x = panelDerechoX;
    const y = panelProductoMesY;
    const w = panelDerechoW;
    const h = 120;

    marcoPanel(x, y, w, h, "PRODUCTO DEL MES", "#c79700", "#fff2bc", "▧");

    let nombre = productoBuscadoMes && productoBuscadoMes.nombre ? productoBuscadoMes.nombre : "No definido";

    textoPixel(nombre, x + 20, y + 70, "bold 13px monospace", "#111");

    textoPixel("Cumple", x + 20, y + 96, "bold 13px monospace", "#111");
    textoPixel(
        cumpleProductoBuscado ? "Sí" : "No",
        x + 160,
        y + 96,
        "bold 13px monospace",
        cumpleProductoBuscado ? "#087a13" : "#c00020"
    );

    textoPixel("Precio", x + 250, y + 96, "bold 13px monospace", "#111");
    textoPixel(
        "$" + clp(precioProducto_CLP_L) + "/L",
        x + w - 24,
        y + 96,
        "bold 13px monospace",
        precioProducto_CLP_L < 0 ? "#c00020" : "#087a13",
        "right"
    );
}