/* ==========================================================================
    CONFIGURACIÓN DE ACCIÓN Y MAPEO DE CAMPOS (GOOGLE FORMS)
   ========================================================================== */
const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

const fields = {
    name: "entry.2061745721",       // ID campo Nombre (Short Answer)
    date: "entry.2092361543",       // ID campo Fechas (Short Answer)
    genres: "entry.1440434680",     // ID campo Géneros (Short Answer)
    email: "entry.2006946810",      // ID campo Email (Short Answer)
    instagram: "entry.1790059981",  // ID campo Instagram (Short Answer)
    whatsapp: "entry.558799515",    // ID campo WhatsApp (Short Answer)
    arrival: "entry.1054994475",    // ID campo Hora de Llegada (Short Answer)
    budget: "entry.2095902647"      // ID campo Presupuesto (Short Answer)
};

/* ==========================================================================
    BLOQUE DE CONFIGURACIÓN DINÁMICA DE CAMPOS
    (Modifica required y visible desde aquí para controlar el comportamiento)
   ========================================================================== */
const EXPERIENCES_CONFIG = {
    name:      { required: true,  visible: true,  label: "Nombre / Code Name" },
    date:      { required: false,  visible: false,  label: "Indica en cuáles de las siguientes fechas tienes disponibilidad." },
    genres:    { required: true,  visible: true,  label: "¿Qué géneros musicales prefieres?" },
    email:     { required: true,  visible: true,  label: "Email" },
    arrival:   { required: true,  visible: true,  label: "Hora estimada de llegada" },
    budget:    { required: true,  visible: true,  label: "Monto estimado destinado a consumo" },
    instagram: { required: false, visible: true,  label: "Instagram" },
    whatsapp:  { required: false, visible: true,  label: "WhatsApp" }
};

/* ==========================================================================
    PARÁMETROS DEL CALENDARIO REUTILIZABLE
   ========================================================================== */
const CALENDAR_CONFIG = {
    year: 2026,          
    month: 7,            // 7 = Julio
    dayOfWeek: 5         // 5 = Viernes
};

/* ==========================================================================
    PARÁMETROS REUTILIZABLES (CONFIGURACIONES)
   ========================================================================== */
const GENRES_CONFIG = [
    "House", "Techno", "Minimal", "Breaks y Bass", 
    "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
];

const ARRIVAL_CONFIG = [
    "Inicio (17:00 - 19:00)",
    "Punto Alto (19:00 - 21:00)",
    "Cierre (21:00 en adelante)"
];

const BUDGET_CONFIG = [
    "Entre $80 MXN y $200 MXN",
    "Entre $200 y $600 MXN",
    "Más de $600 MXN"
];

/* ==========================================================================
    ESTADO GENERAL Y ELEMENTOS DEL DOM
   ========================================================================== */
let registrosAbiertos = true; 

const registerScreen = document.getElementById("registerScreen");
const successScreen = document.getElementById("successScreen");
const limitScreen = document.getElementById("limitScreen");
const errorModal = document.getElementById("errorModal");
const form = document.getElementById("customForm");

const instagramInput = document.getElementById("instagram");
const whatsappCcInput = document.getElementById("whatsapp_cc");
const whatsappLocalInput = document.getElementById("whatsapp_local");

const datesCheckboxGroup = document.getElementById("datesCheckboxGroup");
const genresCheckboxGroup = document.getElementById("genresCheckboxGroup");
const arrivalCheckboxGroup = document.getElementById("arrivalCheckboxGroup");
const budgetCheckboxGroup = document.getElementById("budgetCheckboxGroup");

let otherCheckbox = null;
let otherText = null;

if (form) { form.action = GOOGLE_FORM_ACTION; }

/* ==========================================================================
    GENERADORES DINÁMICOS DE INTERFAZ
   ========================================================================== */

function generarCheckboxesFechas() {
    if (!datesCheckboxGroup) return;
    const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const totalDias EnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
    let html = "";

    for (let dia = 1; dia <= totalDiasEnMes; dia++) {
        const fecha = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month - 1, dia);
        if (fecha.getDay() === CALENDAR_CONFIG.dayOfWeek) {
            const textoFecha = `${diasNombres[CALENDAR_CONFIG.dayOfWeek]} ${dia} de ${mesesNombres[CALENDAR_CONFIG.month - 1]}`;
            html += `
                <label class="checkbox-item">
                    <input type="checkbox" value="${textoFecha}"> ${textoFecha}
                </label>
            `;
        }
    }
    datesCheckboxGroup.innerHTML = html;
}

function generarCheckboxesGeneros() {
    if (!genresCheckboxGroup) return;
    let html = "";
    
    GENRES_CONFIG.forEach(genero => {
        html += `
            <label class="checkbox-item">
                <input type="checkbox" value="${genero}"> ${genero}
            </label>
        `;
    });
    
    html += `
        <div class="other-option-wrap">
            <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Other:</label>
            <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none;">
        </div>
    `;
    genresCheckboxGroup.innerHTML = html;

    otherCheckbox = document.getElementById('otherCheckbox');
    otherText = document.getElementById('otherText');

    if (otherCheckbox && otherText) {
        otherCheckbox.addEventListener('change', function() {
            otherText.style.display = this.checked ? 'block' : 'none';
            if (this.checked) otherText.focus();
            else otherText.value = '';
        });
    }
}

function generarCheckboxesLlegada() {
    if (!arrivalCheckboxGroup) return;
    let html = "";
    
    ARRIVAL_CONFIG.forEach(opcion => {
        html += `
            <label class="checkbox-item">
                <input type="radio" name="arrival_radio" value="${opcion}"> ${opcion}
            </label>
        `;
    });
    
    arrivalCheckboxGroup.innerHTML = html;
}

function generarCheckboxesPresupuesto() {
    if (!budgetCheckboxGroup) return;
    let html = "";
    
    BUDGET_CONFIG.forEach(opcion => {
        html += `
            <label class="checkbox-item">
                <input type="radio" name="budget_radio" value="${opcion}"> ${opcion}
            </label>
        `;
    });
    
    budgetCheckboxGroup.innerHTML = html;
}

/* ==========================================================================
    APLICACIÓN DE CONFIGURACIÓN VISUAL (Mapeado exacto con tu HTML)
   ========================================================================== */
function aplicarConfiguracionCampos() {
    Object.keys(EXPERIENCES_CONFIG).forEach(key => {
        const conf = EXPERIENCES_CONFIG[key];
        
        // Estrategia de búsqueda flexible: busca por ID directo o por el ID del grupo contenedor (ej: datesCheckboxGroup)
        let targetElement = document.getElementById(key) || document.getElementById(`${key}CheckboxGroup`);
        
        if (!targetElement) return;

        // Escalamos al contenedor con la clase `.form-card` provisto en tu HTML
        const cardContainer = targetElement.closest('.form-card');
        if (!cardContainer) return;

        // 1. Gestión de Visibilidad en cascada
        if (!conf.visible) {
            cardContainer.style.display = "none";
            return; 
        } else {
            cardContainer.style.display = "block";
        }

        // 2. Modificación Dinámica del Label interno
        const labelEl = cardContainer.querySelector('.label');
        if (labelEl) {
            let labelText = conf.label; 
            if (conf.required) {
                labelEl.innerHTML = `${labelText} <span class="required" style="color: #ff4a4a; font-weight: bold;">*</span>`;
            } else {
                labelEl.innerHTML = `${labelText} <span class="optional-badge" style="font-size: 0.85em; opacity: 0.6; font-weight: normal;">(Opcional)</span>`;
            }
        }
    });
}

/* ==========================================================================
    FORMATOS AUTOMÁTICOS E INICIALIZACIÓN
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {

    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    // Renderizar los layouts internos dinámicos primero
    generarCheckboxesFechas();
    generarCheckboxesGeneros();
    generarCheckboxesLlegada();
    generarCheckboxesPresupuesto();

    // Sincronizar clases, asteriscos y visibilidad basándonos en tu objeto de configuración
    aplicarConfiguracionCampos();

    if (instagramInput) {
        instagramInput.addEventListener("input", function() {
            if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
        });
        instagramInput.addEventListener("blur", function() {
            if (this.value === "@") this.value = "";
        });
    }

    if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
    if (whatsappLocalInput) {
        whatsappLocalInput.addEventListener("input", function() {
            let num = this.value.replace(/\D/g, "").substring(0, 14);
            let f = "";
            if