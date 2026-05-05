// ======================================================
// 01_variables_config.js
// Archivo generado desde modelo_actualizado_calor_refrigeracion.js
// ======================================================

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
const pasoNivelTermico = 0.20;

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

// Los actuadores térmicos son abiertos, no controladores.
// Calor agrega energía y refrigeración extrae energía.
// Si ambos están activos, compiten y ambos generan costo.
let nivelCalor = 0.0;
let nivelRefrigeracion = 0.0;
let controlTemperaturaActivo = false;

// Modelo térmico clásico de primer orden:
// dTemp/dt = -coefPerdidaAmbiente_h * (Temp - Tamb)
//            + aporteCalorMax_C_h * nivelCalor
//            - extraccionRefrigeracionMax_C_h * nivelRefrigeracion
// Los niveles térmicos avanzan en 5 estados útiles: OFF, 1, 2, 3, 4 y MAX.
const coefPerdidaAmbiente_h = 0.08;
const aporteCalorMax_C_h = 1.8;
const extraccionRefrigeracionMax_C_h = 2.2;

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

const costoCalorMax_CLP_h = 9000.0;
const costoRefrigeracionMax_CLP_h = 18000.0;

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

