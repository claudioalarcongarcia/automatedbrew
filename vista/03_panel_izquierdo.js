function panelTrabajadores() {
    const x = 25;
    const y = 45;
    const w = 315;
    const h = 145;

    marcoPanel(x, y, w, h, "TRABAJADORES", "#0b7a14", "#dff8df", "♟");

    const bw = 92;
    const bh = 42;
    const x1 = x + 14;
    const x2 = x + 111;
    const x3 = x + 208;
    const y1 = y + 52;
    const y2 = y + 98;

    botonCanvas(x1, y1, bw, bh, "Semana\nmañana", trabajadoresSemanaManana > 0 ? "#1f9e3a" : "#0b63b6", contratarTrabajadorSemanaManana);
    botonCanvas(x2, y1, bw, bh, "Semana\ntarde", trabajadoresSemanaTarde > 0 ? "#1f9e3a" : "#0b63b6", contratarTrabajadorSemanaTarde);
    botonCanvas(x3, y1, bw, bh, "Semana\nnoche", trabajadoresSemanaNoche > 0 ? "#1f9e3a" : "#0b63b6", contratarTrabajadorSemanaNoche);

    botonCanvas(x1, y2, bw, bh, "Fin sem.\nmañana", trabajadoresPartTimeManana > 0 ? "#1f9e3a" : "#087d91", contratarPartTimeManana);
    botonCanvas(x2, y2, bw, bh, "Fin sem.\ntarde", trabajadoresPartTimeTarde > 0 ? "#1f9e3a" : "#087d91", contratarPartTimeTarde);
    botonCanvas(x3, y2, bw, bh, "Fin sem.\nnoche", trabajadoresPartTimeNoche > 0 ? "#1f9e3a" : "#087d91", contratarPartTimeNoche);
}

function panelAlimentacion() {
    const x = 25;
    const y = 205;
    const w = 315;
    const h = 120;

    marcoPanel(x, y, w, h, "ALIMENTACIÓN", "#0d8f20", "#dff8df", "▣");

    textoPixel("F in = " + redondear(Fin, 1) + " L/h", x + 35, y + 76, "bold 16px monospace", "#111");
    textoPixel("C in = " + redondear(Sin, 1) + " g/L", x + 35, y + 108, "bold 16px monospace", "#111");

    pipe(x + 195, y + 75, x + 245, y + 75);
    valvulaPixel(x + 238, y + 54, 42, Fin > 0 ? "#27e43f" : "#666");
}

function panelIndicadores() {
    const x = 25;
    const y = 340;
    const w = 315;
    const h = 340;

    marcoPanel(x, y, w, h, "INDICADORES", "#0b4f9a", "#eeeeee", "▥");

    // Fila superior
    barraPixel(x + 38, y + 70, 34, 70, S / 180, "Sustrato", redondear(S, 1), "g/L", "#24bfff");
    barraPixel(x + 140, y + 70, 34, 70, Xv / 16, "X viable", redondear(Xv, 1), "g/L", "#24bfff");
    barraPixel(x + 242, y + 70, 34, 70, Xt / 20, "X total", redondear(Xt, 1), "g/L", "#24bfff");

    // Línea divisoria
    linea(x + 25, y + 185, x + w - 25, y + 185, "#b0b0b0", 2, [8, 8]);

    // Fila inferior
    barraPixel(x + 38, y + 220, 34, 70, O / 100, "Oxígeno", redondear(O, 1), "%", "#30cf5b");
    barraPixel(x + 140, y + 220, 34, 70, Epercent / 14, "Etanol", redondear(Epercent, 1), "%", "#bd39e6");

    let frTemp = (Temp - TempMin) / (TempMax - TempMin);
    barraPixel(
        x + 242,
        y + 220,
        34,
        70,
        frTemp,
        "Baño",
        redondear(Temp, 1),
        "°C",
        (nivelCalor > 0 || nivelRefrigeracion > 0) ? "#ffb000" : "#24a2ff"
    );
}

function panelAccionesIzquierda() {
    const x = 25;
    const y = 695;
    const w = 315;
    const h = 80;

    marcoPanel(x, y, w, h, "ACCIONES", "#6b2fb8", "#e8dff8", "⚙");

    botonCanvas(x + 18, y + 46, 130, 24, pausado ? "PAUSADO" : "EN MARCHA", "#9651db", alternarPausa, "bold 11px monospace");
    botonCanvas(x + 165, y + 46, 130, 24, "REINICIAR", "#c61b1b", reiniciarTodo, "bold 11px monospace");
}