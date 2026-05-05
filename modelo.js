let dt = 0.02;
let horasPorSegundoReal = 1.0;

let t = 0;
let k = 0;
let pausado = true;

let V, S, Xv, Xd, Xt, O, E;

let Fin;
let A;
let G;
let vProducto;
let vDesecho;

// ======================================================
// CALENDARIO, TURNOS Y TRABAJADORES
// ======================================================

const fechaInicioSimulacion = new Date(2026, 3, 1, 8, 0, 0);
let fechaActualSimulacion = new Date(fechaInicioSimulacion);

let horarioTrabajoActivo = false;
let textoFechaHora = "";
let textoHorarioTrabajo = "";
let turnoActualTexto = "";
let tipoTrabajadorActualTexto = "Sin operador";

let trabajadoresSemanaManana = 0;
let trabajadoresSemanaTarde = 0;
let trabajadoresSemanaNoche = 0;

let trabajadoresPartTimeManana = 0;
let trabajadoresPartTimeTarde = 0;
let trabajadoresPartTimeNoche = 0;

const maxTrabajadoresSemana = 3;
const maxTrabajadoresPartTime = 3;

const costoTrabajadorSemana_CLP_mes = 1000000.0;
const costoTrabajadorSemana_CLP_h = costoTrabajadorSemana_CLP_mes / 720.0;

const costoTrabajadorPartTime_CLP_h = costoTrabajadorSemana_CLP_h * 1.5;
const maxHorasPartTimePorSemana = 8.0;

let costoTrabajadoresSemana_CLP = 0.0;
let costoTrabajadoresPartTime_CLP = 0.0;

let horasPartTimeMananaSemana = 0.0;
let horasPartTimeTardeSemana = 0.0;
let horasPartTimeNocheSemana = 0.0;

let claveSemanaActual = "";

// ======================================================
// PRODUCTO BUSCADO DEL MES
// ======================================================

const perfilesProductoBuscado = [
    {
        nombre: "Levadura premium cervecera",
        viabilidadMin: 90.0,
        xvMin: 6.0,
        etanolMin: 0.5,
        etanolMax: 2.0,
        sustratoMax: 5.0,
        factorTemperaturaMin: 0.85,
        precioMax_CLP_L: 2500.0
    },
    {
        nombre: "Levadura de alta concentración",
        viabilidadMin: 85.0,
        xvMin: 8.0,
        etanolMin: 0.5,
        etanolMax: 2.5,
        sustratoMax: 6.0,
        factorTemperaturaMin: 0.80,
        precioMax_CLP_L: 2700.0
    },
    {
        nombre: "Levadura muy viable baja en etanol",
        viabilidadMin: 94.0,
        xvMin: 5.0,
        etanolMin: 0.2,
        etanolMax: 1.2,
        sustratoMax: 4.0,
        factorTemperaturaMin: 0.85,
        precioMax_CLP_L: 2800.0
    },
    {
        nombre: "Levadura estable con etanol protector",
        viabilidadMin: 88.0,
        xvMin: 5.5,
        etanolMin: 1.0,
        etanolMax: 2.0,
        sustratoMax: 5.0,
        factorTemperaturaMin: 0.75,
        precioMax_CLP_L: 2400.0
    },
    {
        nombre: "Levadura económica aceptable",
        viabilidadMin: 80.0,
        xvMin: 4.5,
        etanolMin: 0.5,
        etanolMax: 3.0,
        sustratoMax: 8.0,
        factorTemperaturaMin: 0.70,
        precioMax_CLP_L: 1800.0
    }
];

let planProductosAnual = [];
let productoBuscadoMes = perfilesProductoBuscado[0];
let productoBuscadoTexto = "";
let cumpleProductoBuscado = false;

let mesActualProducto = "";
let mejorPrecioMes_CLP_L = -999999;
let mejorProductoMesTexto = "Sin producto registrado";

function inicializarPlanProductosAnual() {
    planProductosAnual = [];

    for (let i = 0; i < 12; i++) {
        let indice = Math.floor(Math.random() * perfilesProductoBuscado.length);
        planProductosAnual.push(perfilesProductoBuscado[indice]);
    }
}

function actualizarProductoBuscadoDelMes() {
    let mes = fechaActualSimulacion.getMonth();
    productoBuscadoMes = planProductosAnual[mes];

    productoBuscadoTexto =
        productoBuscadoMes.nombre +
        " | precio máximo $" + Math.round(productoBuscadoMes.precioMax_CLP_L).toLocaleString("es-CL") + "/L" +
        " | Viab ≥ " + productoBuscadoMes.viabilidadMin.toFixed(0) + "%" +
        " | Xv ≥ " + productoBuscadoMes.xvMin.toFixed(1) + " g/L" +
        " | EtOH " + productoBuscadoMes.etanolMin.toFixed(1) + " a " + productoBuscadoMes.etanolMax.toFixed(1) + "%" +
        " | S ≤ " + productoBuscadoMes.sustratoMax.toFixed(1) + " g/L";
}

function actualizarMejorProductoDelMes() {
    let mesClave =
        fechaActualSimulacion.getFullYear() + "-" +
        String(fechaActualSimulacion.getMonth() + 1).padStart(2, "0");

    if (mesClave !== mesActualProducto) {
        mesActualProducto = mesClave;
        mejorPrecioMes_CLP_L = -999999;
        mejorProductoMesTexto = "Sin producto registrado este mes";
    }

    if (V > 0 && Xt > 0 && precioProducto_CLP_L > mejorPrecioMes_CLP_L) {
        mejorPrecioMes_CLP_L = precioProducto_CLP_L;

        mejorProductoMesTexto =
            calidadProductoTexto +
            " | $" + Math.round(precioProducto_CLP_L).toLocaleString("es-CL") + "/L" +
            " | Viab " + viabilidad.toFixed(1) + "%" +
            " | Xv " + Xv.toFixed(2) + " g/L" +
            " | EtOH " + Epercent.toFixed(2) + "%" +
            " | S " + S.toFixed(2) + " g/L";
    }
}

function obtenerClaveSemana(fecha) {
    let copia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    let dia = copia.getDay();
    let ajuste = dia === 0 ? -6 : 1 - dia;

    copia.setDate(copia.getDate() + ajuste);

    return (
        copia.getFullYear() + "-" +
        String(copia.getMonth() + 1).padStart(2, "0") + "-" +
        String(copia.getDate()).padStart(2, "0")
    );
}

function actualizarSemanaPartTime() {
    let nuevaClave = obtenerClaveSemana(fechaActualSimulacion);

    if (nuevaClave !== claveSemanaActual) {
        claveSemanaActual = nuevaClave;
        horasPartTimeMananaSemana = 0.0;
        horasPartTimeTardeSemana = 0.0;
        horasPartTimeNocheSemana = 0.0;
    }
}

function actualizarCalendarioSimulacion() {
    fechaActualSimulacion = new Date(fechaInicioSimulacion.getTime() + t * 60 * 60 * 1000);

    let dia = fechaActualSimulacion.getDay();
    let hora = fechaActualSimulacion.getHours();
    let minuto = fechaActualSimulacion.getMinutes();

    actualizarSemanaPartTime();
    actualizarProductoBuscadoDelMes();

    let esLunesAViernes = dia >= 1 && dia <= 5;
    let esSabadoODomingo = dia === 0 || dia === 6;

    if (hora >= 8 && hora < 16) {
        turnoActualTexto = "Turno mañana";
    } else if (hora >= 16 && hora < 24) {
        turnoActualTexto = "Turno tarde";
    } else {
        turnoActualTexto = "Turno noche";
    }

    horarioTrabajoActivo = false;
    tipoTrabajadorActualTexto = "Sin operador";

    if (esLunesAViernes) {
        if (turnoActualTexto === "Turno mañana" && trabajadoresSemanaManana > 0) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Trabajador semana mañana";
        }

        if (turnoActualTexto === "Turno tarde" && trabajadoresSemanaTarde > 0) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Trabajador semana tarde";
        }

        if (turnoActualTexto === "Turno noche" && trabajadoresSemanaNoche > 0) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Trabajador semana noche";
        }
    }

    if (esSabadoODomingo) {
        if (
            turnoActualTexto === "Turno mañana" &&
            trabajadoresPartTimeManana > 0 &&
            horasPartTimeMananaSemana < trabajadoresPartTimeManana * maxHorasPartTimePorSemana
        ) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Part time mañana";
        }

        if (
            turnoActualTexto === "Turno tarde" &&
            trabajadoresPartTimeTarde > 0 &&
            horasPartTimeTardeSemana < trabajadoresPartTimeTarde * maxHorasPartTimePorSemana
        ) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Part time tarde";
        }

        if (
            turnoActualTexto === "Turno noche" &&
            trabajadoresPartTimeNoche > 0 &&
            horasPartTimeNocheSemana < trabajadoresPartTimeNoche * maxHorasPartTimePorSemana
        ) {
            horarioTrabajoActivo = true;
            tipoTrabajadorActualTexto = "Part time noche";
        }
    }

    let dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    textoFechaHora =
        dias[dia] + " " +
        fechaActualSimulacion.toLocaleDateString("es-CL") + " " +
        String(hora).padStart(2, "0") + ":" +
        String(minuto).padStart(2, "0");

    textoHorarioTrabajo = horarioTrabajoActivo
        ? turnoActualTexto + " activo"
        : turnoActualTexto + " sin operador";
}

function puedeOperar() {
    actualizarCalendarioSimulacion();
    return horarioTrabajoActivo && !juegoTerminado;
}

function totalTrabajadoresSemana() {
    return trabajadoresSemanaManana + trabajadoresSemanaTarde + trabajadoresSemanaNoche;
}

function totalTrabajadoresPartTime() {
    return trabajadoresPartTimeManana + trabajadoresPartTimeTarde + trabajadoresPartTimeNoche;
}

function contratarTrabajadorSemanaManana() {
    if (juegoTerminado) return;
    if (totalTrabajadoresSemana() >= maxTrabajadoresSemana) return;
    trabajadoresSemanaManana += 1;
    actualizarCalendarioSimulacion();
}

function contratarTrabajadorSemanaTarde() {
    if (juegoTerminado) return;
    if (totalTrabajadoresSemana() >= maxTrabajadoresSemana) return;
    trabajadoresSemanaTarde += 1;
    actualizarCalendarioSimulacion();
}

function contratarTrabajadorSemanaNoche() {
    if (juegoTerminado) return;
    if (totalTrabajadoresSemana() >= maxTrabajadoresSemana) return;
    trabajadoresSemanaNoche += 1;
    actualizarCalendarioSimulacion();
}

function contratarPartTimeManana() {
    if (juegoTerminado) return;
    if (totalTrabajadoresPartTime() >= maxTrabajadoresPartTime) return;
    trabajadoresPartTimeManana += 1;
    actualizarCalendarioSimulacion();
}

function contratarPartTimeTarde() {
    if (juegoTerminado) return;
    if (totalTrabajadoresPartTime() >= maxTrabajadoresPartTime) return;
    trabajadoresPartTimeTarde += 1;
    actualizarCalendarioSimulacion();
}

function contratarPartTimeNoche() {
    if (juegoTerminado) return;
    if (totalTrabajadoresPartTime() >= maxTrabajadoresPartTime) return;
    trabajadoresPartTimeNoche += 1;
    actualizarCalendarioSimulacion();
}

// ======================================================
// CAPACIDAD Y FLUJOS
// ======================================================

const Vmax = 5000.0;
const Vseguro = 4500.0;
const VminOperativo = 600.0;
const VcasiVacio = 25.0;

const Fmax = 1500.0;
const FinMax = Fmax;
const FProductoMax = Fmax;
const FDesechoMax = Fmax;
const FPaso = 25.0;

let Sin = 60.0;
const SinMin = 0.0;
const SinMax = 180.0;
const SinPaso = 10.0;

const pasoPorcentajeOperacion = 0.10;

// ======================================================
// TEMPERATURA
// ======================================================

let Temp = 30.0;
const TempMin = 5.0;
const TempMax = 45.0;
const TempPaso = 1.0;

let Tamb = 11.5;
let diferenciaTermica = 0.0;

const TambPromedio = 11.5;
const TambAmplitud = 5.5;

let controlTemperaturaActivo = false;
const velocidadEquilibrioTermico = 0.08;

let factorTemperatura = 1.0;
let estresTemperatura = 0.0;

const kMuerteTemperatura = 0.040;

// ======================================================
// PARÁMETROS CINÉTICOS
// ======================================================

const umax = 0.38;
const Ks = 6.0;
const Ko = 18.0;
const Yxs = 0.48;

const kLaAireMax = 2.6;
const kLaAgitacionMax = 1.8;
const Ostar = 100.0;

const kMuerteBase = 0.004;
const kMuerteO2Bajo = 0.030;
const kMuerteEtanol = 0.035;
const kMuerteInanicion = 0.045;
const kMuerteOxidativa = 0.012;
const kMuerteAgitacion = 0.030;

const alturaAgitadorRelativa = 0.35;

const gramosPorLitroPorPorcentajeEtanol = 7.89;

const gramosLevaduraSecaPorClick = 500.0;
const remanenteParedMaximo_g = 250.0;
const fraccionBiomasaQueQuedaEnPared = 0.015;
const tasaRehidratacionPared = 0.35;

// ======================================================
// VARIABLES DE PROCESO
// ======================================================

let Fproducto = 0;
let Fdesecho = 0;
let FsalidaTotal = 0;
let Dentrada = 0;

let aireIn = 0;
let transferenciaO2 = 0;
let consumoO2 = 0;
let aireNoTransferido = 0;
let kLa = 0;

let mu = 0;
let muSinEtanol = 0;
let inhibEtanol = 1.0;
let Epercent = 0;

let consumoS = 0;
let prodEtanol = 0;
let muerte = 0;
let viabilidad = 100;

let estresSustrato = 0;
let estresO2Bajo = 0;
let estresOxidativo = 0;
let estresEtanol = 0;
let estresAgitacion = 0;

let agitacionEfectiva = 0;
let agitadorSumergido = true;

let biomasaViablePared_g = 0;
let levaduraSecaPendiente_g = 0;
let rehidratacionDesdePared_g_h = 0;

let volumenProductoAcumulado = 0;
let volumenDesechoAcumulado = 0;
let biomasaProductoAcumulada_g = 0;
let biomasaDesechoAcumulada_g = 0;

let alarmaSobrellenado = false;
let advertenciaVolumen = false;
let advertenciaBajoVolumen = false;
let recomendacionCosecha = false;
let cultivoMuyBajo = false;

// ======================================================
// ECONOMÍA
// ======================================================

const precioProductoMaloVenta_CLP_L = -5000.0;
const costoDesechoProductoMalo_CLP_L = 2000.0;

const costoSustrato_CLP_kg = 900.0;
const costoAgua_CLP_L = 2.0;
const costoPreparacionMedio_CLP_L = 80.0;
const costoAireacionMax_CLP_h = 1200.0;
const costoAgitacionMax_CLP_h = 1800.0;
const costoLevaduraSeca_CLP_kg = 8000.0;
const costoDesecho_CLP_L = 250.0;

const costoFijoOperacion_CLP_h = 11389.0;
const costoPenalizacionTope_CLP_h = 50000000.0 / 720.0;

const costoRefrigeracion_CLP_h_por_C = 1800.0;
const costoCalefaccion_CLP_h_por_C = 900.0;

let precioProducto_CLP_L = 0.0;
let ingresoProducto_CLP = 0.0;

let costoSustrato_CLP = 0.0;
let costoAgua_CLP = 0.0;
let costoPreparacionMedio_CLP = 0.0;
let costoAireacion_CLP = 0.0;
let costoAgitacion_CLP = 0.0;
let costoLevaduraSeca_CLP = 0.0;
let costoDesecho_CLP = 0.0;
let costoFijoOperacion_CLP = 0.0;
let costoPenalizacionTope_CLP = 0.0;
let costoTermico_CLP = 0.0;
let costoTotal_CLP = 0.0;
let resultadoEconomico_CLP = 0.0;

let sustratoAlimentado_kg = 0.0;
let aguaAlimentada_L = 0.0;
let levaduraSecaAgregada_kg = 0.0;

let calidadProductoTexto = "Sin producto";
let riesgoMicrobianoTexto = "Bajo";

const inversionInicial_CLP = 50000000.0;
const metaVictoria_CLP = 100000000.0;
const limiteDerrota_CLP = -100000000.0;

let resultadoNetoConInversion_CLP = -inversionInicial_CLP;
let juegoTerminado = false;
let mensajeFinalJuego = "";

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

function aumentarTemperatura() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp += TempPaso;
    if (Temp > TempMax) Temp = TempMax;
    calcularFactorTemperatura();
}

function disminuirTemperatura() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp -= TempPaso;
    if (Temp < TempMin) Temp = TempMin;
    calcularFactorTemperatura();
}

function temperaturaBaja() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp = 20.0;
    calcularFactorTemperatura();
}

function temperaturaOptima() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp = 30.0;
    calcularFactorTemperatura();
}

function temperaturaAlta() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = true;
    Temp = 38.0;
    calcularFactorTemperatura();
}

function alternarControlTemperatura() {
    if (!puedeOperar()) return;
    controlTemperaturaActivo = !controlTemperaturaActivo;
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

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

function actualizarTemperaturaAmbiente() {
    Tamb = TambPromedio + TambAmplitud * Math.sin(2.0 * Math.PI * (t - 8.0) / 24.0);
    diferenciaTermica = Math.abs(Temp - Tamb);
}

function calcularCostoTermicoPaso() {
    actualizarTemperaturaAmbiente();

    if (!controlTemperaturaActivo) {
        Temp += velocidadEquilibrioTermico * (Tamb - Temp) * dt;

        if (Temp < TempMin) Temp = TempMin;
        if (Temp > TempMax) Temp = TempMax;

        actualizarTemperaturaAmbiente();
        calcularFactorTemperatura();
        return;
    }

    if (Temp < Tamb) {
        costoTermico_CLP += costoRefrigeracion_CLP_h_por_C * diferenciaTermica * dt;
    } else {
        costoTermico_CLP += costoCalefaccion_CLP_h_por_C * diferenciaTermica * dt;
    }
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

function calcularEscalonViabilidad() {
    if (viabilidad >= 90.0) {
        return 1.00;
    }

    if (viabilidad >= 80.0) {
        return 0.70 + 0.30 * ((viabilidad - 80.0) / 10.0);
    }

    if (viabilidad >= 70.0) {
        return 0.40 + 0.30 * ((viabilidad - 70.0) / 10.0);
    }

    if (viabilidad >= 60.0) {
        return 0.15 + 0.25 * ((viabilidad - 60.0) / 10.0);
    }

    return -1.0;
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

function calcularFactorSustratoBuscado() {
    if (S <= productoBuscadoMes.sustratoMax) {
        return 1.0;
    }

    return Math.max(0.10, 1.0 - (S - productoBuscadoMes.sustratoMax) / 20.0);
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

    let factorViabilidad = calcularEscalonViabilidad();
    let factorBiomasa = Math.min(1.0, Math.max(0.0, Xv / productoBuscadoMes.xvMin));
    let factorSustrato = calcularFactorSustratoBuscado();
    let factorEtanol = calcularFactorEtanolBuscado();
    let factorTermico = Math.min(1.0, Math.max(0.0, factorTemperatura));

    if (
        factorViabilidad < 0.0 ||
        S > 25.0 ||
        Epercent > 6.0 ||
        factorTermico < 0.25 ||
        Xv < 1.0
    ) {
        productoMalo = true;
    }

    cumpleProductoBuscado =
        viabilidad >= productoBuscadoMes.viabilidadMin &&
        Xv >= productoBuscadoMes.xvMin &&
        Epercent >= productoBuscadoMes.etanolMin &&
        Epercent <= productoBuscadoMes.etanolMax &&
        S <= productoBuscadoMes.sustratoMax &&
        factorTemperatura >= productoBuscadoMes.factorTemperaturaMin;

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