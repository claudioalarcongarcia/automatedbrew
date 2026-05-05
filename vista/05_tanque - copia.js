function dibujarTanque() {
    const tanqueX = 410;
    const tanqueY = 210;
    const tanqueW = 280;
    const tanqueH = 350;
    const fondoY = tanqueY + tanqueH;
    const xCentro = tanqueX + tanqueW / 2;

    rectPixel(tanqueX - 22, tanqueY + 95, tanqueW + 44, tanqueH - 55, "#028ee8", "#111", 5);

    ctx.fillStyle = "#14b8ff";
    ctx.fillRect(tanqueX - 14, tanqueY + 105, 14, tanqueH - 80);
    ctx.fillRect(tanqueX + tanqueW, tanqueY + 105, 14, tanqueH - 80);
    ctx.fillRect(tanqueX - 14, fondoY - 28, tanqueW + 28, 18);

    rectSombra(tanqueX, tanqueY, tanqueW, tanqueH, "#eeeeee", "#111", 5);

    ctx.fillStyle = "#f9f9f9";
    ctx.beginPath();
    ctx.ellipse(xCentro, tanqueY + 18, tanqueW / 2, 42, 0, Math.PI, 0);
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#111";
    ctx.stroke();

    let nivel = Math.max(0, Math.min(1, V / Vmax));
    let liquidoH = tanqueH * nivel;
    let liquidoY = fondoY - liquidoH;

    ctx.fillStyle = "#f2c54b";
    ctx.fillRect(tanqueX + 6, liquidoY, tanqueW - 12, Math.max(0, liquidoH - 6));

    ctx.fillStyle = "rgba(255,180,0,0.30)";
    ctx.fillRect(tanqueX + 6, liquidoY, tanqueW - 12, Math.max(0, liquidoH - 6));

    ctx.fillStyle = "rgba(255,255,255,0.50)";
    ctx.fillRect(tanqueX + 25, tanqueY + 42, 16, tanqueH - 85);
    ctx.fillRect(tanqueX + 52, tanqueY + 42, 9, tanqueH - 110);

    let ySeguro = fondoY - tanqueH * (Vseguro / Vmax);
    linea(tanqueX, ySeguro, tanqueX + tanqueW, ySeguro, "#ff9900", 3, [8, 8]);

    let yMin = fondoY - tanqueH * (VminOperativo / Vmax);
    linea(tanqueX, yMin, tanqueX + tanqueW, yMin, "#ff2020", 3, [8, 8]);

    // ======================================================
    // AGITADOR 16 BITS ORIGINAL, CON SOPORTE CORREGIDO
    // Se anima con líquido y también en vacío.
    // El costo económico ya se acumula en modelo.js:
    // costoAgitacion_CLP += costoAgitacionMax_CLP_h * G * G * dt;
    // ======================================================

    let cy = fondoY - tanqueH * alturaAgitadorRelativa;
    let agitadorSumergidoLocal = liquidoY <= cy && V > 0;
    let agitadorEnVacio = G > 0 && !agitadorSumergidoLocal;

    rectPixel(xCentro - 16, tanqueY + 14, 32, 18, "#2b2b2b", "#111", 3);
    ctx.fillStyle = "#777";
    ctx.fillRect(xCentro - 9, tanqueY + 19, 18, 7);

    linea(xCentro, tanqueY + 25, xCentro, cy, "#111", 7);

    let vel = G > 0 ? 0.5 + 18.0 * G : 0;
    let ang = vel > 0 ? t * vel : 0;
    let largo = 55;
    let largoAparente = largo * (0.25 + 0.75 * Math.abs(Math.cos(ang)));

    let colorAgitador = "#555";
    let colorBrillo = "#9bb7e8";

    if (G > 0 && agitadorSumergidoLocal) {
        colorAgitador = "#1b4f9c";
        colorBrillo = "#9bb7e8";
    }

    if (G > 0 && agitadorEnVacio) {
        colorAgitador = "#c77700";
        colorBrillo = "#ffd36a";
    }

    linea(
        xCentro - largoAparente,
        cy,
        xCentro + largoAparente,
        cy,
        colorAgitador,
        11
    );

    linea(
        xCentro - largoAparente,
        cy - 2,
        xCentro + largoAparente,
        cy - 2,
        colorBrillo,
        3
    );

    if (agitadorEnVacio) {
        textoPixel(
            "Agitación en vacío: costo activo",
            xCentro,
            cy + 34,
            "bold 12px monospace",
            "#b06000",
            "center"
        );
    }

    // ======================================================
    // AIREACIÓN COMO BURBUJAS PIXELADAS
    // ======================================================

    if (A > 0 && V > 0) {
        const intensidad = Math.max(0, Math.min(1, A));
        const nBurb = Math.round(8 + 55 * intensidad);
        const tamBase = 3 + 3 * intensidad;
        const velocidad = 25 + 40 * intensidad;
        const anchoUtil = tanqueW - 70;
        const alturaUtil = Math.max(24, liquidoH - 25);

        for (let i = 0; i < nBurb; i++) {
            let col = i % 9;
            let fila = Math.floor(i / 9);

            let baseX = tanqueX + 35 + (col / 8) * anchoUtil;
            let ondulacion = Math.sin(t * 2.0 + i * 0.75) * (5 + 8 * intensidad);
            let bx = baseX + ondulacion;

            let faseB = (t * velocidad + i * 17 + fila * 9) % alturaUtil;
            let by = fondoY - 28 - faseB;

            if (by > liquidoY + 6) {
                let size = tamBase + ((i % 3) - 1) * 0.7;

                ctx.fillStyle = "#d7f0ff";
                ctx.fillRect(bx, by, size, size);

                ctx.fillStyle = "#9ed8ff";
                ctx.fillRect(bx + 1, by + 1, Math.max(1, size - 2), Math.max(1, size - 2));
            }
        }
    }

    // ======================================================
    // TUBERÍA DE ALIMENTACIÓN
    // ======================================================

    pipeCodo([
        { x: 290, y: 280 },
        { x: 365, y: 280 },
        { x: 365, y: 315 },
        { x: tanqueX, y: 315 }
    ]);

    if (Fin > 0) {
        flujoPuntos(295, 280, 365, 280, "#30c950", 4);
        flujoPuntos(365, 280, 365, 315, "#30c950", 3);
        flujoPuntos(365, 315, tanqueX - 10, 315, "#30c950", 4);
    }

    // ======================================================
    // SALIDA DESECHO
    // ======================================================

    const yDes = 660;

    pipeCodo([
        { x: xCentro - 65, y: fondoY },
        { x: xCentro - 65, y: yDes },
        { x: 395, y: yDes }
    ]);

    textoPixel("Desecho " + Math.round(vDesecho * 100) + "%", 435, yDes - 28, "bold 13px monospace", "#111", "center");
    valvulaPixel(412, yDes - 22, 44, Fdesecho > 0 ? "#ff3b3b" : "#666");
    textoPixel(redondear(Fdesecho, 1) + " L/h", 435, yDes + 55, "bold 13px monospace", "#111", "center");

    if (Fdesecho > 0 && V > 0) {
        flujoPuntos(xCentro - 65, yDes, 395, yDes, "#d11f1f", 8);
    }

    // ======================================================
    // SALIDA PRODUCTO
    // ======================================================

    const yProd = 660;

    pipeCodo([
        { x: xCentro + 65, y: fondoY },
        { x: xCentro + 65, y: yProd },
        { x: 755, y: yProd }
    ]);

    textoPixel("Producto " + Math.round(vProducto * 100) + "%", 710, yProd - 28, "bold 13px monospace", "#111", "center");
    valvulaPixel(687, yProd - 22, 44, Fproducto > 0 ? "#2692ff" : "#666");
    textoPixel(redondear(Fproducto, 1) + " L/h", 710, yProd + 55, "bold 13px monospace", "#111", "center");

    if (Fproducto > 0 && V > 0) {
        flujoPuntos(xCentro + 65, yProd, 755, yProd, "#8b00c8", 8);
    }

    textoPixel(
        G <= 0 ? "Agitación: DETENIDA" : "Agitación: " + Math.round(G * 100) + "%",
        xCentro,
        735,
        "bold 14px monospace",
        G > 0 && V <= 0 ? "#b06000" : "#111",
        "center"
    );

    textoPixel(
        A <= 0 ? "Aireación: DETENIDA" : "Aireación: " + Math.round(A * 100) + "%",
        xCentro,
        760,
        "bold 14px monospace",
        "#0b63b6",
        "center"
    );
}