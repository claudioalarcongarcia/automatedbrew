// ======================================================
// 03_auxiliares_economia.js
// Archivo generado desde modelo_actualizado_calor_refrigeracion.js
// ======================================================

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

function actualizarTemperaturaAmbiente() {
    Tamb = TambPromedio + TambAmplitud * Math.sin(2.0 * Math.PI * (t - 8.0) / 24.0);
    diferenciaTermica = Math.abs(Temp - Tamb);
}

function calcularCostoTermicoPaso() {
    actualizarTemperaturaAmbiente();
    actualizarEstadoTermico();

    // Modelo térmico clásico de primer orden con potencia moderada.
    // El ambiente no es un actuador: solo intercambia calor según la diferencia Temp - Tamb.
    // Si Temp > Tamb, el término ambiente enfría.
    // Si Temp < Tamb, el término ambiente calienta relativamente.
    // Calor siempre suma energía.
    // Refrigeración siempre extrae energía.
    let perdidaAmbiente = -coefPerdidaAmbiente_h * (Temp - Tamb);
    let aporteCalor = aporteCalorMax_C_h * nivelCalor;
    let extraccionRefrigeracion = extraccionRefrigeracionMax_C_h * nivelRefrigeracion;

    let dTemp_dt = perdidaAmbiente + aporteCalor - extraccionRefrigeracion;

    Temp += dTemp_dt * dt;

    if (Temp < TempMin) Temp = TempMin;
    if (Temp > TempMax) Temp = TempMax;

    // El costo depende del uso de los actuadores, no de si logran cambiar la temperatura.
    costoTermico_CLP += costoCalorMax_CLP_h * nivelCalor * dt;
    costoTermico_CLP += costoRefrigeracionMax_CLP_h * nivelRefrigeracion * dt;

    actualizarTemperaturaAmbiente();
    calcularFactorTemperatura();
}

function actualizarCostoTrabajadoresPaso() {
    let totalSemana = totalTrabajadoresSemana();

    costoTrabajadoresSemana_CLP += totalSemana * costoTrabajadorSemana_CLP_h * dt;

    let dia = fechaActualSimulacion.getDay();
    let esFinDeSemana = dia === 0 || dia === 6;

    if (!esFinDeSemana) {
        return;
    }

    if (!horarioTrabajoActivo) {
        return;
    }

    if (turnoActualTexto === "Turno mañana" && trabajadoresPartTimeManana > 0) {
        let horasDisponibles = trabajadoresPartTimeManana * maxHorasPartTimePorSemana - horasPartTimeMananaSemana;
        let horasTrabajadas = Math.min(dt, Math.max(0, horasDisponibles));

        horasPartTimeMananaSemana += horasTrabajadas;
        costoTrabajadoresPartTime_CLP += horasTrabajadas * costoTrabajadorPartTime_CLP_h;
    }

    if (turnoActualTexto === "Turno tarde" && trabajadoresPartTimeTarde > 0) {
        let horasDisponibles = trabajadoresPartTimeTarde * maxHorasPartTimePorSemana - horasPartTimeTardeSemana;
        let horasTrabajadas = Math.min(dt, Math.max(0, horasDisponibles));

        horasPartTimeTardeSemana += horasTrabajadas;
        costoTrabajadoresPartTime_CLP += horasTrabajadas * costoTrabajadorPartTime_CLP_h;
    }

    if (turnoActualTexto === "Turno noche" && trabajadoresPartTimeNoche > 0) {
        let horasDisponibles = trabajadoresPartTimeNoche * maxHorasPartTimePorSemana - horasPartTimeNocheSemana;
        let horasTrabajadas = Math.min(dt, Math.max(0, horasDisponibles));

        horasPartTimeNocheSemana += horasTrabajadas;
        costoTrabajadoresPartTime_CLP += horasTrabajadas * costoTrabajadorPartTime_CLP_h;
    }

    actualizarCalendarioSimulacion();
}

function calcularFactorTemperatura() {
    if (Temp >= 28.0 && Temp <= 32.0) {
        factorTemperatura = 1.0;
    } else if (Temp < 28.0) {
        factorTemperatura = Math.exp(-Math.pow((Temp - 28.0) / 8.0, 2));
    } else {
        factorTemperatura = Math.exp(-Math.pow((Temp - 32.0) / 6.0, 2));
    }

    if (factorTemperatura < 0.02) {
        factorTemperatura = 0.02;
    }

    estresTemperatura = 0.0;

    if (Temp < 18.0) {
        estresTemperatura = (18.0 - Temp) / 18.0;
    }

    if (Temp > 36.0) {
        estresTemperatura = (Temp - 36.0) / 14.0;
    }

    if (estresTemperatura > 1.0) {
        estresTemperatura = 1.0;
    }

    if (estresTemperatura < 0.0) {
        estresTemperatura = 0.0;
    }
}

function calcularInhibicionEtanol() {
    Epercent = E / gramosPorLitroPorPorcentajeEtanol;

    if (Epercent <= 4) {
        inhibEtanol = 1.0;
    } else if (Epercent > 4 && Epercent < 12) {
        inhibEtanol = 1.0 - ((Epercent - 4) / 8);
    } else {
        inhibEtanol = 0.0;
    }

    if (inhibEtanol < 0) inhibEtanol = 0;
    if (inhibEtanol > 1) inhibEtanol = 1;
}

function calcularFactorViabilidadBuscada() {
    if (!productoBuscadoMes) {
        return 1.0;
    }

    if (productoBuscadoMes.viabilidadMax !== undefined) {
        if (viabilidad <= productoBuscadoMes.viabilidadMax) {
            return 1.0;
        }

        return Math.max(0.0, productoBuscadoMes.viabilidadMax / Math.max(viabilidad, 0.001));
    }

    if (productoBuscadoMes.viabilidadMin !== undefined) {
        if (viabilidad >= productoBuscadoMes.viabilidadMin) {
            return 1.0;
        }

        return Math.max(0.0, viabilidad / productoBuscadoMes.viabilidadMin);
    }

    return 1.0;
}

function cumpleViabilidadBuscada() {
    if (!productoBuscadoMes) {
        return true;
    }

    if (productoBuscadoMes.viabilidadMax !== undefined) {
        return viabilidad <= productoBuscadoMes.viabilidadMax;
    }

    if (productoBuscadoMes.viabilidadMin !== undefined) {
        return viabilidad >= productoBuscadoMes.viabilidadMin;
    }

    return true;
}

function calcularFactorBiomasaBuscada() {
    if (!productoBuscadoMes) {
        return 1.0;
    }

    if (productoBuscadoMes.xvMax !== undefined) {
        if (Xv <= productoBuscadoMes.xvMax) {
            return 1.0;
        }

        return Math.max(0.0, productoBuscadoMes.xvMax / Math.max(Xv, 0.001));
    }

    if (productoBuscadoMes.xvMin !== undefined) {
        return Math.min(1.0, Math.max(0.0, Xv / productoBuscadoMes.xvMin));
    }

    return 1.0;
}

function cumpleBiomasaBuscada() {
    if (!productoBuscadoMes) {
        return true;
    }

    if (productoBuscadoMes.xvMax !== undefined) {
        return Xv <= productoBuscadoMes.xvMax;
    }

    if (productoBuscadoMes.xvMin !== undefined) {
        return Xv >= productoBuscadoMes.xvMin;
    }

    return true;
}

function calcularFactorEtanolBuscado() {
    if (Epercent >= productoBuscadoMes.etanolMin && Epercent <= productoBuscadoMes.etanolMax) {
        return 1.0;
    }

    if (Epercent < productoBuscadoMes.etanolMin) {
        return Math.max(0.15, Epercent / productoBuscadoMes.etanolMin);
    }

    let exceso = Epercent - productoBuscadoMes.etanolMax;
    return Math.max(0.15, 1.0 - exceso / 4.0);
}

function cumpleEtanolBuscado() {
    return Epercent >= productoBuscadoMes.etanolMin && Epercent <= productoBuscadoMes.etanolMax;
}

function calcularFactorSustratoBuscado() {
    if (!productoBuscadoMes) {
        return 1.0;
    }

    if (productoBuscadoMes.sustratoMin !== undefined && S < productoBuscadoMes.sustratoMin) {
        return Math.max(0.10, S / productoBuscadoMes.sustratoMin);
    }

    if (productoBuscadoMes.sustratoMax !== undefined && S > productoBuscadoMes.sustratoMax) {
        return Math.max(0.10, 1.0 - (S - productoBuscadoMes.sustratoMax) / 25.0);
    }

    return 1.0;
}

function cumpleSustratoBuscado() {
    if (!productoBuscadoMes) {
        return true;
    }

    if (productoBuscadoMes.sustratoMin !== undefined && S < productoBuscadoMes.sustratoMin) {
        return false;
    }

    if (productoBuscadoMes.sustratoMax !== undefined && S > productoBuscadoMes.sustratoMax) {
        return false;
    }

    return true;
}

function calcularPrecioProducto() {
    let productoMalo = false;
    cumpleProductoBuscado = false;

    if (V <= 0 || Xt <= 0) {
        precioProducto_CLP_L = 0.0;
        calidadProductoTexto = "Sin producto";
        riesgoMicrobianoTexto = "Bajo";
        return;
    }

    let factorViabilidad = calcularFactorViabilidadBuscada();
    let factorBiomasa = calcularFactorBiomasaBuscada();
    let factorSustrato = calcularFactorSustratoBuscado();
    let factorEtanol = calcularFactorEtanolBuscado();
    let factorTermico = Math.min(1.0, Math.max(0.0, factorTemperatura));

    if (
        S > 60.0 ||
        Epercent > 10.0 ||
        factorTermico < 0.25 ||
        (productoBuscadoMes.xvMin !== undefined && Xv < 0.3)
    ) {
        productoMalo = true;
    }

    cumpleProductoBuscado =
        cumpleViabilidadBuscada() &&
        cumpleBiomasaBuscada() &&
        cumpleEtanolBuscado() &&
        cumpleSustratoBuscado();

    if (productoMalo) {
        precioProducto_CLP_L = precioProductoMaloVenta_CLP_L;
        calidadProductoTexto = "Malo: vender penaliza, desechar cuesta menos";
    } else if (cumpleProductoBuscado) {
        precioProducto_CLP_L = productoBuscadoMes.precioMax_CLP_L;
        calidadProductoTexto = "Producto buscado del mes: " + productoBuscadoMes.nombre;
    } else {
        let indiceCalidad =
            factorViabilidad *
            factorBiomasa *
            factorSustrato *
            factorEtanol *
            factorTermico;

        if (indiceCalidad < 0) {
            indiceCalidad = 0;
        }

        precioProducto_CLP_L = productoBuscadoMes.precioMax_CLP_L * indiceCalidad;

        if (precioProducto_CLP_L >= 1800.0) {
            calidadProductoTexto = "Muy buena, no cumple todo el producto buscado";
        } else if (precioProducto_CLP_L >= 900.0) {
            calidadProductoTexto = "Buena";
        } else if (precioProducto_CLP_L >= 0.0) {
            calidadProductoTexto = "Regular o bajo valor";
        } else {
            calidadProductoTexto = "Malo: vender penaliza, desechar cuesta menos";
        }
    }

    if (S > 15.0 && Epercent < 1.0) {
        riesgoMicrobianoTexto = "Alto";
    } else if (S > 8.0 && Epercent < 0.5) {
        riesgoMicrobianoTexto = "Medio";
    } else {
        riesgoMicrobianoTexto = "Bajo";
    }
}

function actualizarEconomiaPaso(dVentrada, dVproducto, dVdesecho) {
    actualizarCalendarioSimulacion();

    let sustratoEntrada_g = Sin * dVentrada;
    let sustratoEntrada_kg = sustratoEntrada_g / 1000.0;

    sustratoAlimentado_kg += sustratoEntrada_kg;
    aguaAlimentada_L += dVentrada;

    costoSustrato_CLP += sustratoEntrada_kg * costoSustrato_CLP_kg;
    costoAgua_CLP += dVentrada * costoAgua_CLP_L;
    costoPreparacionMedio_CLP += dVentrada * costoPreparacionMedio_CLP_L;

    costoAireacion_CLP += costoAireacionMax_CLP_h * A * dt;
    costoAgitacion_CLP += costoAgitacionMax_CLP_h * G * G * dt;

    actualizarCostoTrabajadoresPaso();
    calcularCostoTermicoPaso();

    calcularPrecioProducto();
    actualizarMejorProductoDelMes();

    if (precioProducto_CLP_L < 0) {
        costoDesecho_CLP += dVdesecho * costoDesechoProductoMalo_CLP_L;
    } else {
        costoDesecho_CLP += dVdesecho * costoDesecho_CLP_L;
    }

    costoFijoOperacion_CLP += costoFijoOperacion_CLP_h * dt;

    if (V >= Vmax) {
        costoPenalizacionTope_CLP += costoPenalizacionTope_CLP_h * dt;
    }

    ingresoProducto_CLP += precioProducto_CLP_L * dVproducto;

    actualizarEconomiaAcumulada();
}

function actualizarEconomiaAcumulada() {
    costoTotal_CLP =
        costoSustrato_CLP +
        costoAgua_CLP +
        costoPreparacionMedio_CLP +
        costoAireacion_CLP +
        costoAgitacion_CLP +
        costoLevaduraSeca_CLP +
        costoDesecho_CLP +
        costoFijoOperacion_CLP +
        costoPenalizacionTope_CLP +
        costoTermico_CLP +
        costoTrabajadoresSemana_CLP +
        costoTrabajadoresPartTime_CLP;

    resultadoEconomico_CLP = ingresoProducto_CLP - costoTotal_CLP;

    resultadoNetoConInversion_CLP = resultadoEconomico_CLP - inversionInicial_CLP;

    if (!juegoTerminado && resultadoNetoConInversion_CLP >= metaVictoria_CLP) {
        juegoTerminado = true;
        pausado = true;
        mensajeFinalJuego = "Felicidades, lograste triunfar en el negocio de la fermentación.";
    }

    if (!juegoTerminado && resultadoNetoConInversion_CLP <= limiteDerrota_CLP) {
        juegoTerminado = true;
        pausado = true;
        mensajeFinalJuego = "Qué lamentable, has perdido en el juego de la fermentación.";
    }
}

