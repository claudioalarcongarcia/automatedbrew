function rectPixel(x, y, w, h, fill, stroke = "#111", lw = 3) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);

    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.strokeRect(x, y, w, h);
}

function rectSombra(x, y, w, h, fill, stroke = "#111", lw = 3) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 5, y + 5, w, h);

    rectPixel(x, y, w, h, fill, stroke, lw);

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.fillRect(x + 4, y + 4, w - 8, 4);

    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.fillRect(x + 4, y + h - 8, w - 8, 4);
}

function texto(txt, x, y, font = "14px monospace", color = "#111", align = "left") {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(txt, x, y);
    ctx.restore();
}

function textoPixel(txt, x, y, font = "bold 16px monospace", color = "#111", align = "left") {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillText(txt, x + 1, y + 1);

    ctx.fillStyle = color;
    ctx.fillText(txt, x, y);

    ctx.restore();
}

function linea(x1, y1, x2, y2, color = "#111", lw = 4, dash = []) {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

function pipe(x1, y1, x2, y2, color = "#c0c0c0") {
    linea(x1, y1, x2, y2, "#111", 10);
    linea(x1, y1, x2, y2, color, 6);
    linea(x1, y1 - 2, x2, y2 - 2, "rgba(255,255,255,0.65)", 2);
}

function pipeCodo(puntos, color = "#c0c0c0") {
    for (let i = 0; i < puntos.length - 1; i++) {
        pipe(puntos[i].x, puntos[i].y, puntos[i + 1].x, puntos[i + 1].y, color);
    }
}

function marcoPanel(x, y, w, h, titulo, colorHeader, colorBody = "#e8eef2", icono = "") {
    rectSombra(x, y, w, h, colorBody, "#222", 4);

    ctx.fillStyle = colorHeader;
    ctx.fillRect(x + 4, y + 4, w - 8, 34);

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, w - 8, 34);

    if (icono !== "") {
        textoPixel(icono, x + 15, y + 28, "bold 18px monospace", "#fff", "left");
        textoPixel(titulo, x + 48, y + 28, "bold 16px monospace", "#fff", "left");
    } else {
        textoPixel(titulo, x + 16, y + 28, "bold 16px monospace", "#fff", "left");
    }
}

function valvulaPixel(x, y, size = 42, colorLuz = "#666") {
    rectSombra(x, y, size, size, "#9c9c9c", "#222", 3);

    ctx.fillStyle = "#cfcfcf";
    ctx.fillRect(x + 7, y + 7, size - 14, size - 14);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 10, y + 10, size - 20, size - 20);

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = colorLuz;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + size / 2 - 2, y + size / 2 - 2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fill();
}

function barraPixel(x, y, w, h, fraccion, titulo, valor, unidad, colorRelleno = "#24bfff") {
    fraccion = Math.max(0, Math.min(1, fraccion));

    textoPixel(titulo, x + w / 2, y - 10, "bold 12px monospace", "#111", "center");

    rectPixel(x, y, w, h, "#e5e5e5", "#111", 3);

    ctx.fillStyle = "#1e2b36";
    ctx.fillRect(x + 6, y + 6, w - 12, h - 12);

    const fh = (h - 14) * fraccion;

    ctx.fillStyle = colorRelleno;
    ctx.fillRect(x + 7, y + h - 7 - fh, w - 14, fh);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x + 9, y + h - 7 - fh, 5, fh);

    for (let i = 1; i < 6; i++) {
        let yy = y + i * h / 6;
        linea(x + w, yy, x + w + 8, yy, "#444", 2);
    }

    textoPixel(unidad, x + w / 2, y + h + 18, "bold 12px monospace", "#111", "center");
    textoPixel(valor, x + w / 2, y + h + 36, "bold 12px monospace", "#0b63b6", "center");
}

function flujoPuntos(x1, y1, x2, y2, color, n = 7) {
    for (let i = 0; i < n; i++) {
        let f = (t * 2.3 + i / n) % 1;
        let x = x1 + (x2 - x1) * f;
        let y = y1 + (y2 - y1) * f;

        ctx.fillStyle = color;
        ctx.fillRect(x - 3, y - 3, 6, 6);
    }
}