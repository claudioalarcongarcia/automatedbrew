// ======================================================
// 04_modelo_principal.js
// Archivo generado desde modelo_actualizado_calor_refrigeracion.js
// ======================================================

// ======================================================
// MODELO PRINCIPAL
// ======================================================

function actualizarModelo() {
    if (juegoTerminado) {
        return;
    }

    actualizarCalendarioSimulacion();
    actualizarTemperaturaAmbiente();

    if (V >= Vmax) {
        alarmaSobrellenado = true;
    } else {
        alarmaSobrellenado = false;
    }

    Fproducto = FProductoMax * vProducto;
    Fdesecho = FDesechoMax * vDesecho;
    FsalidaTotal = Fproducto + Fdesecho;

    if (FsalidaTotal > V / dt && FsalidaTotal > 0) {
        let factor = (V / dt) / FsalidaTotal;
        Fproducto *= factor;
        Fdesecho *= factor;
        FsalidaTotal = Fproducto + Fdesecho;
    }

    if (V <= VcasiVacio && FsalidaTotal > 0) {
        capturarRemanenteEnParedes();

        V = 0;
        S = 0;
        Xv = 0;
        Xd = 0;
        Xt = 0;
        O = 0;
        E = 0;

        vProducto = 0;
        vDesecho = 0;
        Fproducto = 0;
        Fdesecho = 0;
        FsalidaTotal = 0;

        actualizarEconomiaPaso(0, 0, 0);

        t += dt;
        k++;
        actualizarCalendarioSimulacion();
        return;
    }

    if (V <= 0 && Fin > 0) {
        let dVentradaVacio = Fin * dt;

        V = V + dVentradaVacio;
        S = Sin;
        O = 20;

        hidratarLevaduraSeca();
        rehidratarParedes();

        actualizarEconomiaPaso(dVentradaVacio, 0, 0);

        t += dt;
        k++;

        aplicarSaturaciones();
        calcularInhibicionEtanol();
        actualizarTemperaturaAmbiente();
        calcularFactorTemperatura();
        calcularPrecioProducto();
        actualizarEconomiaAcumulada();
        actualizarCalendarioSimulacion();
        actualizarMejorProductoDelMes();

        return;
    }

    if (V <= 0 && Fin <= 0) {
        actualizarEconomiaPaso(0, 0, 0);

        t += dt;
        k++;
        actualizarCalendarioSimulacion();
        return;
    }

    let dVentrada = Fin * dt;
    let dVproducto = Fproducto * dt;
    let dVdesecho = Fdesecho * dt;

    volumenProductoAcumulado += dVproducto;
    volumenDesechoAcumulado += dVdesecho;

    biomasaProductoAcumulada_g += Xv * dVproducto;
    biomasaDesechoAcumulada_g += Xv * dVdesecho;

    actualizarEconomiaPaso(dVentrada, dVproducto, dVdesecho);

    Dentrada = Fin / V;

    let Vnext = V + dt * (Fin - FsalidaTotal);

    if (Vnext < 0) {
        Vnext = 0;
    }

    let alturaLiquidoRelativa = V / Vmax;

    if (alturaLiquidoRelativa >= alturaAgitadorRelativa) {
        agitacionEfectiva = G;
        agitadorSumergido = true;
    } else {
        agitacionEfectiva = 0;
        agitadorSumergido = false;
    }

    hidratarLevaduraSeca();
    rehidratarParedes();

    let limitS = S / (Ks + S);
    let limitO = O / (Ko + O);

    calcularInhibicionEtanol();
    calcularFactorTemperatura();

    muSinEtanol = umax * limitS * limitO;
    mu = muSinEtanol * inhibEtanol * factorTemperatura;

    let crecimiento = mu * Xv;
    consumoS = crecimiento / Yxs;

    let excesoS = Math.max(0, S - 35) / 100;
    let faltaO = Math.max(0, 45 - O) / 45;

    prodEtanol = 0.18 * Xv * excesoS * faltaO;

    estresO2Bajo = Math.max(0, 25 - O) / 25;
    estresSustrato = Math.max(0, 3 - S) / 3;

    estresEtanol = Math.max(0, Epercent - 5) / 7;

    if (estresEtanol > 1) {
        estresEtanol = 1;
    }

    estresOxidativo = 0;

    if (S < 3 && O > 85) {
        estresOxidativo = ((O - 85) / 15) * ((3 - S) / 3);
    }

    estresAgitacion = agitacionEfectiva * agitacionEfectiva;

    muerte = Xv * (
        kMuerteBase +
        kMuerteO2Bajo * estresO2Bajo +
        kMuerteEtanol * estresEtanol +
        kMuerteInanicion * estresSustrato +
        kMuerteOxidativa * estresOxidativo +
        kMuerteAgitacion * estresAgitacion +
        kMuerteTemperatura * estresTemperatura
    );

    aireIn = 120.0 * A;

    kLa = kLaAireMax * A + kLaAgitacionMax * agitacionEfectiva;

    transferenciaO2 = kLa * (Ostar - O);

    let limiteTransferencia = aireIn + 40.0 * agitacionEfectiva;

    if (transferenciaO2 > limiteTransferencia) {
        transferenciaO2 = limiteTransferencia;
    }

    if (transferenciaO2 < 0) {
        transferenciaO2 = 0;
    }

    let consumoO2Base = 0.60 * Xv;
    let consumoO2Crecimiento = 18.0 * mu * Xv;

    consumoO2 = consumoO2Base + consumoO2Crecimiento;

    aireNoTransferido = aireIn - transferenciaO2;

    if (aireNoTransferido < 0) {
        aireNoTransferido = 0;
    }

    let Snext = S + dt * (Dentrada * (Sin - S) - consumoS);
    let Xvnext = Xv + dt * (crecimiento - muerte - Dentrada * Xv);
    let Xdnext = Xd + dt * (muerte - Dentrada * Xd);
    let Enext = E + dt * (prodEtanol - Dentrada * E);
    let Onext = O + dt * (transferenciaO2 - consumoO2 - Dentrada * O);

    V = Vnext;
    S = Snext;
    Xv = Xvnext;
    Xd = Xdnext;
    E = Enext;
    O = Onext;

    if (V > Vmax) {
        V = Vmax;
        alarmaSobrellenado = true;
    }

    aplicarSaturaciones();
    calcularInhibicionEtanol();
    actualizarTemperaturaAmbiente();
    calcularFactorTemperatura();
    calcularPrecioProducto();
    actualizarEconomiaAcumulada();
    actualizarMejorProductoDelMes();

    advertenciaVolumen = V > Vseguro;
    advertenciaBajoVolumen = V > 0 && V < VminOperativo;
    cultivoMuyBajo = Xv > 0 && Xv < 0.05;

    recomendacionCosecha =
        (V >= Vseguro) ||
        (viabilidad < 85) ||
        (Epercent > 8) ||
        (S < 2 && Xv > 6);

    t += dt;
    k++;
    actualizarCalendarioSimulacion();
}

function capturarRemanenteEnParedes() {
    let biomasaTotalLiquida_g = Xv * V;
    let remanenteNuevo = biomasaTotalLiquida_g * fraccionBiomasaQueQuedaEnPared;

    if (remanenteNuevo < 5 && biomasaTotalLiquida_g > 0) {
        remanenteNuevo = 5;
    }

    biomasaViablePared_g += remanenteNuevo;

    if (biomasaViablePared_g > remanenteParedMaximo_g) {
        biomasaViablePared_g = remanenteParedMaximo_g;
    }
}

function hidratarLevaduraSeca() {
    if (V <= 0) return;
    if (levaduraSecaPendiente_g <= 0) return;

    Xv += levaduraSecaPendiente_g / V;
    levaduraSecaPendiente_g = 0;
}

function rehidratarParedes() {
    rehidratacionDesdePared_g_h = 0;

    if (V <= 0) return;
    if (biomasaViablePared_g <= 0) return;

    let factorVolumen = Math.min(1, V / VminOperativo);
    let gramosRehidratados = biomasaViablePared_g * tasaRehidratacionPared * factorVolumen * dt;

    if (gramosRehidratados > biomasaViablePared_g) {
        gramosRehidratados = biomasaViablePared_g;
    }

    biomasaViablePared_g -= gramosRehidratados;
    rehidratacionDesdePared_g_h = gramosRehidratados / dt;

    Xv += gramosRehidratados / V;
}

function aplicarSaturaciones() {
    if (V < 0) V = 0;
    if (S < 0) S = 0;
    if (Xv < 0) Xv = 0;
    if (Xd < 0) Xd = 0;
    if (E < 0) E = 0;
    if (O > 100) O = 100;
    if (O < 0) O = 0;

    Xt = Xv + Xd;

    if (Xt > 0) {
        viabilidad = 100 * Xv / Xt;
    } else {
        viabilidad = 0;
    }
}

reiniciarTodo();