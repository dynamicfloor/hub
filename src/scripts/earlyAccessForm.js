const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";
//https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/viewform?usp=header

const fields = {
    name: "entry.2061745721",       // ID campo Nombre (Short Answer)
    date: "entry.2092361543",       // ID campo Fechas (Short Answer)
    genres: "entry.1440434680",     // ID campo Géneros (Short Answer)
    email: "entry.2006946810",      // ID campo Email (Short Answer)
    instagram: "entry.1790059981",  // ID campo Instagram (Short Answer)
    whatsapp: "entry.558799515",   // ID campo WhatsApp (Short Answer)
    arrival: "entry.1054994475",    // ID campo Hora de Llegada (Short Answer)
    budget: "entry.2095902647"      // ID campo Presupuesto (Short Answer)
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
    PARÁMETROS DE GÉNEROS REUTILIZABLES
   ========================================================================== */
const GENRES_CONFIG = [
    "House", "Techno", "Minimal", "Breaks y Bass", 
    "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
];

/* ==========================================================================
   PARÁMETROS LOGÍSTICOS REUTILIZABLES
   ========================================================================== */
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

/* =========================
   Estado General del Formulario
========================= */
let registrosAbiertos = true; 

/* =========================
   Elementos de la Interfaz
========================= */
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

if(form) { form.action = GOOGLE_FORM_ACTION; }

/* ==========================================================================
   Generadores Dinámicos de Interfaz (Formato .forEach Unificado)
   ========================================================================== */

// 1. Generar Fechas del Calendario
function generarCheckboxesFechas() {
    if (!datesCheckboxGroup) return;
    const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const totalDiasEnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
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

// 2. Generar Lista de Géneros
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

// 3. Generar Opciones de Llegada
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

// 4. Generar Opciones de Presupuesto
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

/* =========================
   Formatos Automáticos e Inicialización
========================= */
document.addEventListener("DOMContentLoaded", () => {

    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    generarCheckboxesFechas();
    generarCheckboxesGeneros();
    generarCheckboxesLlegada();
    generarCheckboxesPresupuesto();

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
            if (num.length > 0) f += num.substring(0, 3);
            if (num.length > 3) f += " " + num.substring(3, 6);
            if (num.length > 6) f += " " + num.substring(6, 14);
            this.value = f;
        });
    }
});

function showErrorModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    errorModal.showModal();
}

/* =========================
   Validación y Envío (Pipeline ETL con Aplanado Dinámico)
========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!registrosAbiertos) return;

    const nameVal = document.getElementById("name").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const instagramVal = instagramInput.value.trim();

    if (
        instagramVal &&
        !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)
    ) {
        showErrorModal(
            "Usuario de Instagram inválido",
            "Ingresa únicamente tu usuario de Instagram, por ejemplo: @hola. Si no tienes Instagram, puedes dejar este campo en blanco."
        );
        return;
    }
    
    if (!nameVal || !emailVal) {
        showErrorModal("Campos incompletos", "Por favor, ingresa tu Nombre y tu Correo electrónico.");
        return;
    }

    const emailInput = document.getElementById("email");

    if (!emailInput.checkValidity()) {
        showErrorModal(
            "Correo inválido",
            "Por favor ingresa un correo válido, ejemplo: hola@gmail.com."
        );
        return;
    }

    const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
    if (checkedDates.length === 0) {
        showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
        return;
    }

    const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
    if (checkedGenres.length === 0) {
        showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical.");
        return;
    }
    if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
        showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido.");
        return;
    }

    const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
    const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');

    if (!selectedArrival || !selectedBudget) {
        showErrorModal("Campos requeridos", "Por favor indica tu hora estimada de llegada y tu presupuesto aproximado.");
        return;
    }

    // --- CONSTRUCCIÓN DEL DATA PACKET ---
    const formData = new URLSearchParams();
    formData.append(fields.name, nameVal);
    formData.append(fields.email, emailVal);
    formData.append(fields.instagram, instagramInput.value.trim());
    
    formData.append(fields.arrival, selectedArrival.value);
    formData.append(fields.budget, selectedBudget.value);

    // Formatear WhatsApp
    const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
    const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
    if (localPuro.length > 0) {
        formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
    } else {
        formData.append(fields.whatsapp, "");
    }

    // 1. Aplanar fechas seleccionadas por comas
    const listaFechas = [];
    checkedDates.forEach(cb => listaFechas.push(cb.value));
    formData.append(fields.date, listaFechas.join(", "));

    // 2. 🔥 Aplanar géneros seleccionados por comas (incluyendo el campo libre "Other")
    const listaGeneros = [];
    checkedGenres.forEach(cb => {
        if (cb.value === "__other_option__") {
            const valorOtro = otherText.value.trim();
            if (valorOtro) {
                listaGeneros.push(valorOtro);
            }
        } else {
            listaGeneros.push(cb.value);
        }
    });
    formData.append(fields.genres, listaGeneros.join(", "));

    try {
        await fetch(form.action, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        registerScreen.style.display = "none";
        successScreen.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
        form.reset();
    } catch (error) {
        console.error("Error:", error);
        showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
    }
});

// //CONFIGURACIÓN DE TU GOOGLE FORM (Edita solo esta sección con tus IDs reales)
// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeSBO8Z2Z73xObEO4YjRkMrFKuzYp_MCqI0DdJXUbJOuONewQ/formResponse";

// const fields = {
//     name: "entry.1153782677",      // ID real de tu campo Nombre
//     date: "entry.2222222222",      // ID real de tu campo de Fechas (Short Answer / Texto)
//     genres: "entry.3333333333",    // ID real de tus Checkboxes de Géneros
//     genresOther: "entry.3333333333.other_option_response", // Mismo ID de Géneros + .other_option_response
//     email: "entry.4444444444",     
//     instagram: "entry.5555555555", 
//     whatsapp: "entry.6666666666"   
// };

// /* ==========================================================================
//    CONFIGURACIÓN DEL CALENDARIO REUTILIZABLE
//    ========================================================================== */
// const CALENDAR_CONFIG = {
//     year: 2026,          // Año del evento
//     month: 7,            // Número de Mes (1 = Enero, ..., 7 = Julio, etc.)
//     dayOfWeek: 5         // Qué día buscas (0 = Domingo, ..., 5 = Viernes, 6 = Sábado)
// };

// /* ==========================================================================
//    CONFIGURACIÓN DE GÉNEROS MUSICALES REUTILIZABLE
//    Modifica, añade o quita los géneros de esta lista según el enfoque de tu evento
//    ========================================================================== */
// const GENRES_CONFIG = [
//     "House",
//     "Techno",
//     "Minimal",
//     "Breaks y Bass",
//     "Ambient y Experimental",
//     "Disco y Funk",
//     "Global y Orgánico",
//     "Trance",
//     "Música Urbana"
// ];

// /* =========================
//    Estado General del Formulario
// ========================= */
// let registrosAbiertos = true; 

// /* =========================
//    Elementos de la Interfaz
// ========================= */
// const registerScreen = document.getElementById("registerScreen");
// const successScreen = document.getElementById("successScreen");
// const limitScreen = document.getElementById("limitScreen");
// const errorModal = document.getElementById("errorModal");

// const form = document.getElementById("customForm");
// const instagramInput = document.getElementById("instagram");
// const whatsappCcInput = document.getElementById("whatsapp_cc");
// const whatsappLocalInput = document.getElementById("whatsapp_local");

// const datesCheckboxGroup = document.getElementById("datesCheckboxGroup");
// const genresCheckboxGroup = document.getElementById("genresCheckboxGroup");

// // Variables globales para los elementos de "Other" (se asignarán dinámicamente)
// let otherCheckbox = null;
// let otherText = null;

// // Asignar dinámicamente la URL de acción al formulario al cargar
// if(form) { form.action = GOOGLE_FORM_ACTION; }

// /* ==========================================================================
//    Generadores Automáticos de Interfaz (UI)
//    ========================================================================== */

// // 1. Generador de Fechas por Calendario
// function generarCheckboxesFechas() {
//     if (!datesCheckboxGroup) return;

//     const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
//     const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

//     const targetYear = CALENDAR_CONFIG.year;
//     const targetMonthIndex = CALENDAR_CONFIG.month - 1;
//     const targetDayOfWeek = CALENDAR_CONFIG.dayOfWeek;

//     const totalDiasEnMes = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
//     let htmlInyectable = "";

//     for (let dia = 1; dia <= totalDiasEnMes; dia++) {
//         const fechaEvaluar = new Date(targetYear, targetMonthIndex, dia);
//         if (fechaEvaluar.getDay() === targetDayOfWeek) {
//             const textoFecha = `${diasNombres[targetDayOfWeek]} ${dia} de ${mesesNombres[targetMonthIndex]}`;
//             htmlInyectable += `
//                 <label class="checkbox-item">
//                     <input type="checkbox" value="${textoFecha}"> ${textoFecha}
//                 </label>
//             `;
//         }
//     }
//     datesCheckboxGroup.innerHTML = htmlInyectable;
// }

// // 2. Generador de Géneros Musicales + Opción Abierta
// function generarCheckboxesGeneros() {
//     if (!genresCheckboxGroup) return;

//     let htmlInyectable = "";

//     // Inyectar los géneros estructurados en la lista de configuración
//     GENRES_CONFIG.forEach(genero => {
//         htmlInyectable += `
//             <label class="checkbox-item">
//                 <input type="checkbox" value="${genero}"> ${genero}
//             </label>
//         `;
//     });

//     // Inyectar al final la estructura fija para la opción abierta "Other"
//     htmlInyectable += `
//         <div class="other-option-wrap">
//             <label class="checkbox-item">
//                 <input type="checkbox" value="__other_option__" id="otherCheckbox"> Other:
//             </label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none;">
//         </div>
//     `;

//     genresCheckboxGroup.innerHTML = htmlInyectable;

//     // Vincular las variables a los elementos recién creados en el DOM
//     otherCheckbox = document.getElementById('otherCheckbox');
//     otherText = document.getElementById('otherText');

//     // Inicializar el escuchador de eventos para el despliegue de "Other"
//     if (otherCheckbox && otherText) {
//         otherCheckbox.addEventListener('change', function() {
//             if (this.checked) {
//                 otherText.style.display = 'block';
//                 otherText.focus();
//             } else {
//                 otherText.style.display = 'none';
//                 otherText.value = '';
//             }
//         });
//     }
// }

// /* =========================
//    Formateo Automático de Inputs de Contacto
// ========================= */
// document.addEventListener("DOMContentLoaded", () => {
//     // Renderizar la UI dinámica al cargar la página
//     generarCheckboxesFechas();
//     generarCheckboxesGeneros();

//     // Auto-formatear INSTAGRAM (Asegurar la @ al inicio)
//     if (instagramInput) {
//         instagramInput.addEventListener("input", function() {
//             let val = this.value;
//             if (val.length > 0 && !val.startsWith("@")) {
//                 this.value = "@" + val;
//             }
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") { this.value = ""; }
//         });
//     }

//     // Controlar entrada de CÓDIGO DE PAÍS DE WHATSAPP
//     if (whatsappCcInput) {
//         whatsappCcInput.addEventListener("input", function() {
//             this.value = this.value.replace(/\D/g, "");
//         });
//     }

//     // Auto-formatear NÚMERO LOCAL DE WHATSAPP
//     if (whatsappLocalInput) {
//         whatsappLocalInput.addEventListener("input", function() {
//             let numbers = this.value.replace(/\D/g, "");
//             numbers = numbers.substring(0, 14);

//             let formatted = "";
//             if (numbers.length > 0) { formatted += numbers.substring(0, 3); }
//             if (numbers.length > 3) { formatted += " " + numbers.substring(3, 6); }
//             if (numbers.length > 6) { formatted += " " + numbers.substring(6, 14); }

//             this.value = formatted;
//         });
//     }
// });

// /* =========================
//    Helper: Desplegar Modal Personalizado
// ========================= */
// function showErrorModal(title, message) {
//     document.getElementById('modalTitle').innerText = title;
//     document.getElementById('modalMessage').innerText = message;
//     errorModal.showModal();
// }

// /* =========================
//    Validación y Envío de Formulario
// ========================= */
// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
  
//     if (!registrosAbiertos) {
//         registerScreen.style.display = "none";
//         successScreen.style.display = "none";
//         limitScreen.style.display = "block";
//         return;
//     }

//     // 1. Obtener valores de campos de texto obligatorios
//     const nameVal = document.getElementById("name").value.trim();
//     const emailVal = document.getElementById("email").value.trim();
    
//     if (!nameVal || !emailVal) {
//         showErrorModal("Campos incompletos", "Por favor, ingresa tu Nombre y tu Correo electrónico.");
//         return;
//     }

//     // 2. Validar Checkboxes de FECHAS
//     const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//     if (checkedDates.length === 0) {
//         showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
//         return;
//     }

//     // 3. Validar Checkboxes de GÉNEROS MUSICALES
//     const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//     if (checkedGenres.length === 0) {
//         showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical de la lista.");
//         return;
//     }

//     // 4. Validar consistencia de opción "Other"
//     if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//         showErrorModal("Especifica tu género", "Has marcado la casilla 'Other'. Por favor, escribe tu género musical preferido.");
//         return;
//     }

//     // --- PROCESAMIENTO E INYECCIÓN DE PARÁMETROS ---
//     const formData = new URLSearchParams();

//     formData.append(fields.name, nameVal);
//     formData.append(fields.email, emailVal);
//     formData.append(fields.instagram, instagramInput.value.trim());

//     // Fusión de campos de WhatsApp
//     const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//     const localPuro = whatsappLocalInput.value.replace(/\D/g, "");

//     if (localPuro.length > 0) {
//         const codigoPaisFinal = ccPuro.length > 0 ? ccPuro : "52";
//         formData.append(fields.whatsapp, codigoPaisFinal + localPuro);
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     // Procesar Fechas separadas por comas
//     const listaFechasArray = [];
//     checkedDates.forEach(cb => { listaFechasArray.push(cb.value); });
//     formData.append(fields.date, listaFechasArray.join(", "));

//     // Procesar Géneros (Se omitirá el renglón de '__other_option__' para no ensuciar la base de datos de Google)
//     checkedGenres.forEach(cb => {
//         if (cb.value !== "__other_option__") {
//             formData.append(fields.genres, cb.value);
//         }
//     });

//     // Si "Other" está activo en géneros, mandar de manera independiente la caja de texto libre adjunta
//     if (otherCheckbox && otherCheckbox.checked) {
//         formData.append(fields.genresOther, otherText.value.trim());
//     }

//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         /* CAMBIO DE VISUALIZACIÓN A PANTALLA DE ÉXITO */
//         registerScreen.style.display = "none";
//         limitScreen.style.display = "none";
//         successScreen.style.display = "block";

//         window.scrollTo({ top: 0, behavior: "smooth" });

//     } catch (error) {
//         console.error("Error al enviar:", error);
//         showErrorModal("Error de conexión", "Hubo un problema de red al enviar tus datos. Inténtalo de nuevo.");
//     }
// });