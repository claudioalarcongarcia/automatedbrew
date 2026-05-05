// ======================================================
// CONFIGURACIÓN DE PANELES DERECHOS
// ======================================================

const panelDerechoX = 780;
const panelDerechoW = 470;

const panelProcesoY = 45;
const panelResultadoY = 205;
const panelGabineteY = 292;
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
    controlTemperaturaActivo = true;
    Temp = TempMax;
    calcularFactorTemperatura();
}

function refrigeracionMaxima() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp = TempMin;
    calcularFactorTemperatura();
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

    const x1 = x + 18;
    const x2 = x + 140;
    const x3 = x + 290;
    const x4 = x + 448;

    let yy = y + 56;
    const dy = 17;

    texto("Fecha", x1, yy, "bold 11px monospace");
    texto(textoFechaHora, x2, yy, "bold 10px monospace");
    texto("T baño", x3, yy, "bold 11px monospace");
    texto(redondear(Temp, 1) + " °C", x4, yy, "bold 11px monospace", "#111", "right");
    yy += dy;

    texto("Turno", x1, yy, "bold 11px monospace");
    texto(turnoActualTexto, x2, yy, "bold 10px monospace");
    texto("T amb", x3, yy, "bold 11px monospace");
    texto(redondear(Tamb, 1) + " °C", x4, yy, "bold 11px monospace", "#111", "right");
    yy += dy;

    texto("Operador", x1, yy, "bold 11px monospace");
    texto(tipoTrabajadorActualTexto, x2, yy, "bold 10px monospace");
    texto("Trabajo", x3, yy, "bold 11px monospace");
    texto(horarioTrabajoActivo ? "ON" : "OFF", x4, yy, "bold 11px monospace", horarioTrabajoActivo ? "#087a13" : "#c00020", "right");
    yy += dy;

    texto("Velocidad", x1, yy, "bold 11px monospace");
    texto(horarioTrabajoActivo ? "x0.5" : "x4", x2, yy, "bold 11px monospace");
    texto("Volumen", x3, yy, "bold 11px monospace");
    texto(redondear(V, 1) + " L", x4, yy, "bold 11px monospace", "#111", "right");
    yy += dy;

    texto("Tiempo", x1, yy, "bold 11px monospace");
    texto(redondear(t, 1) + " h", x2, yy, "bold 11px monospace");
    texto("Meses", x3, yy, "bold 11px monospace");
    texto(redondear(t / 720, 3), x4, yy, "bold 11px monospace", "#111", "right");

    linea(x + 270, y + 50, x + 270, y + 124, "#5aa1dd", 2);
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
    botonCanvas(x, y, w, h, label, color, accion, "bold 8px monospace");
}

function filaGabinete(yFila, titulo, colorHeader, colorBody, botones) {
    const x = panelDerechoX + 12;
    const w = panelDerechoW - 24;
    const h = 38;

    rectPixel(x, yFila, w, h, colorBody, "#111", 3);

    ctx.fillStyle = colorHeader;
    ctx.fillRect(x + 3, yFila + 3, 155, h - 6);

    textoPixel(titulo, x + 10, yFila + 26, "bold 10px monospace", "#fff", "left");

    const bx0 = x + 166;
    const by = yFila + 7;
    const bw = 66;
    const bh = 24;
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
    const h = 347;

    marcoPanel(x, y, w, h, "GABINETE DE CONTROL", "#1f2933", "#dddddd", "");

    const y0 = y + 47;
    const paso = 37;

    // ======================================================
    // 1. SUSTRATO E INÓCULO
    // ======================================================

    rectPixel(x + 12, y0, w - 24, 54, "#eef6e8", "#111", 3);

    ctx.fillStyle = "#0d8f20";
    ctx.fillRect(x + 15, y0 + 3, 155, 48);

    textoPixel("SUSTRATO", x + 24, y0 + 22, "bold 10px monospace", "#fff", "left");
    textoPixel("E INÓCULO", x + 24, y0 + 42, "bold 10px monospace", "#fff", "left");

    textoPixel("Sustrato", x + 184, y0 + 20, "bold 9px monospace", "#111", "left");
    botonMini(x + 250, y0 + 7, 76, 21, "Disminuir", "#1cb7ca", disminuirSustratoEntrada);
    botonMini(x + 334, y0 + 7, 76, 21, "Aumentar", "#1cb7ca", aumentarSustratoEntrada);

    textoPixel("Inóculo", x + 184, y0 + 45, "bold 9px monospace", "#111", "left");
    botonMini(x + 250, y0 + 31, 160, 21, "Agregar levadura", "#6b2fb8", agregarLevaduraSeca);

    // ======================================================
    // 2. FLUJO ENTRADA ALIMENTACIÓN
    // ======================================================

    filaGabinete(
        y0 + 59,
        "ENTRADA ALIM.",
        "#0d8f20",
        "#e7f8e7",
        [
            { texto: "Cerrar", color: "#777", accion: cerrarAlimentacion },
            { texto: "Disminuir", color: "#35b943", accion: disminuirAlimentacion },
            { texto: "Aumentar", color: "#35b943", accion: aumentarAlimentacion },
            { texto: "Máximo", color: "#35b943", accion: llenadoMaximo }
        ]
    );

    // ======================================================
    // 3. FLUJO SALIDA PRODUCTO
    // ======================================================

    filaGabinete(
        y0 + 59 + paso,
        "SALIDA PROD.",
        "#0b63b6",
        "#e1f1ff",
        [
            { texto: "Cerrar", color: "#777", accion: cerrarProducto },
            { texto: "Disminuir", color: "#338be8", accion: disminuirSalidaProducto },
            { texto: "Aumentar", color: "#338be8", accion: aumentarSalidaProducto },
            { texto: "Máximo", color: "#338be8", accion: abrirProductoCompleto }
        ]
    );

    // ======================================================
    // 4. FLUJO SALIDA DESECHO
    // ======================================================

    filaGabinete(
        y0 + 59 + paso * 2,
        "SALIDA DESECHO",
        "#a20f18",
        "#ffe2e2",
        [
            { texto: "Cerrar", color: "#777", accion: cerrarDesecho },
            { texto: "Disminuir", color: "#c61b1b", accion: disminuirSalidaDesecho },
            { texto: "Aumentar", color: "#c61b1b", accion: aumentarSalidaDesecho },
            { texto: "Máximo", color: "#c61b1b", accion: abrirDesechoCompleto }
        ]
    );

    // ======================================================
    // 5. CALOR
    // ======================================================

    filaGabinete(
        y0 + 59 + paso * 3,
        "CALOR",
        "#c76018",
        "#fff0df",
        [
            { texto: "Apagado", color: "#777", accion: apagarControlTermico },
            { texto: "Disminuir", color: "#e58a32", accion: disminuirTemperatura },
            { texto: "Aumentar", color: "#e58a32", accion: aumentarTemperatura },
            { texto: "Máximo", color: "#e58a32", accion: calorMaximo }
        ]
    );

    // ======================================================
    // 6. REFRIGERACIÓN
    // ======================================================

    filaGabinete(
        y0 + 59 + paso * 4,
        "REFRIG.",
        "#087d91",
        "#dff8ff",
        [
            { texto: "Apagado", color: "#777", accion: apagarControlTermico },
            { texto: "Disminuir", color: "#1cb7ca", accion: aumentarTemperatura },
            { texto: "Aumentar", color: "#1cb7ca", accion: disminuirTemperatura },
            { texto: "Máximo", color: "#1cb7ca", accion: refrigeracionMaxima }
        ]
    );

    // ======================================================
    // 7. AIREACIÓN
    // ======================================================

    filaGabinete(
        y0 + 59 + paso * 5,
        "AIREACIÓN",
        "#0b63b6",
        "#e1f1ff",
        [
            { texto: "Apagado", color: "#777", accion: apagarAireacion },
            { texto: "Disminuir", color: "#338be8", accion: disminuirAireacion },
            { texto: "Aumentar", color: "#338be8", accion: aumentarAireacion },
            { texto: "Máximo", color: "#338be8", accion: aireacionMaxima }
        ]
    );

    // ======================================================
    // 8. AGITACIÓN
    // ======================================================

    filaGabinete(
        y0 + 59 + paso * 6,
        "AGITACIÓN",
        "#b8860b",
        "#fff4d6",
        [
            { texto: "Apagado", color: "#777", accion: apagarAgitacion },
            { texto: "Disminuir", color: "#d9a823", accion: disminuirAgitacion },
            { texto: "Aumentar", color: "#d9a823", accion: aumentarAgitacion },
            { texto: "Máximo", color: "#d9a823", accion: agitacionMaxima }
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