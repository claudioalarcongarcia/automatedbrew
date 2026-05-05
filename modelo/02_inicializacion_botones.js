// ======================================================
// 02_inicializacion_botones.js
// Archivo generado desde modelo_actualizado_calor_refrigeracion.js
// ======================================================

// ======================================================
// INICIALIZACIÓN
// ======================================================

function reiniciarTodo() {
    inicializarPlanProductosAnual();

    V = 0.0;
    S = 0.0;
    Xv = 0.0;
    Xd = 0.0;
    Xt = 0.0;
    O = 0.0;
    E = 0.0;

    Fin = 0.0;
    A = 0.0;
    G = 0.0;
    vProducto = 0.0;
    vDesecho = 0.0;

    Sin = 60.0;

    trabajadoresSemanaManana = 0;
    trabajadoresSemanaTarde = 0;
    trabajadoresSemanaNoche = 0;

    trabajadoresPartTimeManana = 0;
    trabajadoresPartTimeTarde = 0;
    trabajadoresPartTimeNoche = 0;

    costoTrabajadoresSemana_CLP = 0.0;
    costoTrabajadoresPartTime_CLP = 0.0;

    horasPartTimeMananaSemana = 0.0;
    horasPartTimeTardeSemana = 0.0;
    horasPartTimeNocheSemana = 0.0;
    claveSemanaActual = "";

    biomasaViablePared_g = 0.0;
    levaduraSecaPendiente_g = 0.0;
    rehidratacionDesdePared_g_h = 0.0;

    volumenProductoAcumulado = 0.0;
    volumenDesechoAcumulado = 0.0;
    biomasaProductoAcumulada_g = 0.0;
    biomasaDesechoAcumulada_g = 0.0;

    precioProducto_CLP_L = 0.0;
    ingresoProducto_CLP = 0.0;

    costoSustrato_CLP = 0.0;
    costoAgua_CLP = 0.0;
    costoPreparacionMedio_CLP = 0.0;
    costoAireacion_CLP = 0.0;
    costoAgitacion_CLP = 0.0;
    costoLevaduraSeca_CLP = 0.0;
    costoDesecho_CLP = 0.0;
    costoFijoOperacion_CLP = 0.0;
    costoPenalizacionTope_CLP = 0.0;
    costoTermico_CLP = 0.0;

    costoTotal_CLP = 0.0;
    resultadoEconomico_CLP = 0.0;
    resultadoNetoConInversion_CLP = -inversionInicial_CLP;

    sustratoAlimentado_kg = 0.0;
    aguaAlimentada_L = 0.0;
    levaduraSecaAgregada_kg = 0.0;

    calidadProductoTexto = "Sin producto";
    riesgoMicrobianoTexto = "Bajo";

    mesActualProducto = "";
    mejorPrecioMes_CLP_L = -999999;
    mejorProductoMesTexto = "Sin producto registrado";

    juegoTerminado = false;
    mensajeFinalJuego = "";

    t = 0.0;
    k = 0;
    pausado = true;

    alarmaSobrellenado = false;
    advertenciaVolumen = false;
    advertenciaBajoVolumen = false;
    recomendacionCosecha = false;
    cultivoMuyBajo = false;

    actualizarCalendarioSimulacion();
    actualizarTemperaturaAmbiente();

    Temp = Tamb;
    diferenciaTermica = Math.abs(Temp - Tamb);
    nivelCalor = 0.0;
    nivelRefrigeracion = 0.0;
    controlTemperaturaActivo = false;

    factorTemperatura = 1.0;
    estresTemperatura = 0.0;

    calcularFactorTemperatura();
    calcularInhibicionEtanol();
    calcularPrecioProducto();
}

// ======================================================
// BOTONES
// ======================================================

function aumentarAlimentacion() {
    if (!puedeOperar()) return;
    Fin += FPaso;
    if (Fin > FinMax) Fin = FinMax;
}

function disminuirAlimentacion() {
    if (!puedeOperar()) return;
    Fin -= FPaso;
    if (Fin < 0) Fin = 0;
}

function llenadoMaximo() {
    if (!puedeOperar()) return;
    Fin = FinMax;
}

function cerrarAlimentacion() {
    if (!puedeOperar()) return;
    Fin = 0;
}

function aumentarSustratoEntrada() {
    if (!puedeOperar()) return;
    Sin += SinPaso;
    if (Sin > SinMax) Sin = SinMax;
}

function disminuirSustratoEntrada() {
    if (!puedeOperar()) return;
    Sin -= SinPaso;
    if (Sin < SinMin) Sin = SinMin;
}

function sustratoEntradaBajo() {
    if (!puedeOperar()) return;
    Sin = 30.0;
}

function sustratoEntradaMedio() {
    if (!puedeOperar()) return;
    Sin = 60.0;
}

function sustratoEntradaAlto() {
    if (!puedeOperar()) return;
    Sin = 120.0;
}

function actualizarEstadoTermico() {
    controlTemperaturaActivo = nivelCalor > 0 || nivelRefrigeracion > 0;
}

function normalizarNivelTermico(valor) {
    valor = Math.round(valor / pasoNivelTermico) * pasoNivelTermico;
    if (valor < 0) valor = 0;
    if (valor > 1) valor = 1;
    return Number(valor.toFixed(2));
}

function aumentarCalor() {
    if (!puedeOperar()) return;
    nivelCalor = normalizarNivelTermico(nivelCalor + pasoNivelTermico);
    actualizarEstadoTermico();
}

function disminuirCalor() {
    if (!puedeOperar()) return;
    nivelCalor = normalizarNivelTermico(nivelCalor - pasoNivelTermico);
    actualizarEstadoTermico();
}

function apagarCalor() {
    if (!puedeOperar()) return;
    nivelCalor = 0;
    actualizarEstadoTermico();
}

function calorMaximo() {
    if (!puedeOperar()) return;
    nivelCalor = 1;
    actualizarEstadoTermico();
}

function aumentarRefrigeracion() {
    if (!puedeOperar()) return;
    nivelRefrigeracion = normalizarNivelTermico(nivelRefrigeracion + pasoNivelTermico);
    actualizarEstadoTermico();
}

function disminuirRefrigeracion() {
    if (!puedeOperar()) return;
    nivelRefrigeracion = normalizarNivelTermico(nivelRefrigeracion - pasoNivelTermico);
    actualizarEstadoTermico();
}

function apagarRefrigeracion() {
    if (!puedeOperar()) return;
    nivelRefrigeracion = 0;
    actualizarEstadoTermico();
}

function refrigeracionMaxima() {
    if (!puedeOperar()) return;
    nivelRefrigeracion = 1;
    actualizarEstadoTermico();
}

// Funciones antiguas conservadas como alias para compatibilidad con la vista.
function aumentarTemperatura() {
    aumentarCalor();
}

function disminuirTemperatura() {
    aumentarRefrigeracion();
}

function temperaturaBaja() {
    refrigeracionMaxima();
}

function temperaturaOptima() {
    if (!puedeOperar()) return;
    nivelCalor = 0;
    nivelRefrigeracion = 0;
    actualizarEstadoTermico();
}

function temperaturaAlta() {
    calorMaximo();
}

function alternarControlTemperatura() {
    if (!puedeOperar()) return;

    if (nivelCalor > 0 || nivelRefrigeracion > 0) {
        nivelCalor = 0;
        nivelRefrigeracion = 0;
    } else {
        nivelCalor = pasoNivelTermico;
    }

    actualizarEstadoTermico();
}

function aumentarSalidaProducto() {
    if (!puedeOperar()) return;
    vProducto += pasoPorcentajeOperacion;
    if (vProducto > 1) vProducto = 1;
}

function disminuirSalidaProducto() {
    if (!puedeOperar()) return;
    vProducto -= pasoPorcentajeOperacion;
    if (vProducto < 0) vProducto = 0;
}

function abrirProductoCompleto() {
    if (!puedeOperar()) return;
    vProducto = 1;
}

function cerrarProducto() {
    if (!puedeOperar()) return;
    vProducto = 0;
}

function aumentarSalidaDesecho() {
    if (!puedeOperar()) return;
    vDesecho += pasoPorcentajeOperacion;
    if (vDesecho > 1) vDesecho = 1;
}

function disminuirSalidaDesecho() {
    if (!puedeOperar()) return;
    vDesecho -= pasoPorcentajeOperacion;
    if (vDesecho < 0) vDesecho = 0;
}

function abrirDesechoCompleto() {
    if (!puedeOperar()) return;
    vDesecho = 1;
}

function cerrarDesecho() {
    if (!puedeOperar()) return;
    vDesecho = 0;
}

function aumentarAireacion() {
    if (!puedeOperar()) return;
    A += pasoPorcentajeOperacion;
    if (A > 1) A = 1;
}

function disminuirAireacion() {
    if (!puedeOperar()) return;
    A -= pasoPorcentajeOperacion;
    if (A < 0) A = 0;
}

function aumentarAgitacion() {
    if (!puedeOperar()) return;
    G += pasoPorcentajeOperacion;
    if (G > 1) G = 1;
}

function disminuirAgitacion() {
    if (!puedeOperar()) return;
    G -= pasoPorcentajeOperacion;
    if (G < 0) G = 0;
}

function alternarPausa() {
    if (!juegoTerminado) {
        pausado = !pausado;
    }
}

function agregarLevaduraSeca() {
    if (!puedeOperar()) return;

    levaduraSecaPendiente_g += gramosLevaduraSecaPorClick;

    let kgAgregados = gramosLevaduraSecaPorClick / 1000.0;

    levaduraSecaAgregada_kg += kgAgregados;
    costoLevaduraSeca_CLP += kgAgregados * costoLevaduraSeca_CLP_kg;

    if (V > 0) {
        Xv += gramosLevaduraSecaPorClick / V;
        levaduraSecaPendiente_g -= gramosLevaduraSecaPorClick;

        if (levaduraSecaPendiente_g < 0) {
            levaduraSecaPendiente_g = 0;
        }
    }

    pausado = false;
    aplicarSaturaciones();
    calcularInhibicionEtanol();
    actualizarTemperaturaAmbiente();
    calcularFactorTemperatura();
    calcularPrecioProducto();
    actualizarEconomiaAcumulada();
    actualizarMejorProductoDelMes();
}

