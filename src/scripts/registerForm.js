const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

const fields = {
    name: "entry.2061745721",       
    date: "entry.2092361543",       
    genres: "entry.1440434680",     
    email: "entry.2006946810",      
    instagram: "entry.1790059981",  
    whatsapp: "entry.558799515",   
    arrival: "entry.1054994475",    
    budget: "entry.2095902647"      
};

/* ==========================================================================
    BLOQUE DE CONFIGURACIÓN DE OBLIGATORIEDAD / DESPLIEGUE
    true  = Obligatorio (*)
    false = Opcional
    null  = No desplegar en interfaz Y enviar el texto "null" a Google Forms
   ========================================================================== */
const FORM_STRUCTURE_CONFIG = {
    name: true,
    date: null,
    genres: false,
    email: true,
    instagram: false,
    whatsapp: false,
    arrival: true,
    budget: false
};

/* ==========================================================================
    CONFIGURACIONES DE CONTENIDO REUTILIZABLE
   ========================================================================== */
const CALENDAR_CONFIG = { year: 2026, month: 7, dayOfWeek: 5 };
const GENRES_CONFIG = ["House", "Techno", "Minimal", "Breaks y Bass", "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"];
const ARRIVAL_CONFIG = ["Inicio (17:00 - 19:00)", "Punto Alto (19:00 - 21:00)", "Cierre (21:00 en adelante)"];
const BUDGET_CONFIG = ["Entre $80 MXN y $200 MXN", "Entre $200 y $600 MXN", "Más de $600 MXN"];

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
    Manejador Dinámico de Visibilidad y Estado (*)
   ========================================================================== */
function aplicarEstructuraConfig() {
    Object.keys(FORM_STRUCTURE_CONFIG).forEach(key => {
        const estado = FORM_STRUCTURE_CONFIG[key];
        const card = document.querySelector(`.form-card[data-campo="${key}"]`);
        
        if (!card) return;

        if (estado === null) {
            card.style.display = "none";
        } else {
            card.style.display = "block";
            const indicador = card.querySelector(".indicador-estado");
            if (indicador) {
                indicador.innerText = estado ? " *" : "";
                indicador.style.color = estado ? "var(--pink, #ff4a5a)" : "transparent"; 
            }
        }
    });
}

/* ==========================================================================
    Generadores Dinámicos de Interfaz
   ========================================================================== */
function generarCheckboxesFechas() {
    if (!datesCheckboxGroup || FORM_STRUCTURE_CONFIG.date === null) return;
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

function generarCheckboxesGeneros() {
    if (!genresCheckboxGroup || FORM_STRUCTURE_CONFIG.genres === null) return;
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
    if (!arrivalCheckboxGroup || FORM_STRUCTURE_CONFIG.arrival === null) return;
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
    if (!budgetCheckboxGroup || FORM_STRUCTURE_CONFIG.budget === null) return;
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

    aplicarEstructuraConfig();
    generarCheckboxesFechas();
    generarCheckboxesGeneros();
    generarCheckboxesLlegada();
    generarCheckboxesPresupuesto();

    if (instagramInput && FORM_STRUCTURE_CONFIG.instagram !== null) {
        instagramInput.addEventListener("input", function() {
            if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
        });
        instagramInput.addEventListener("blur", function() {
            if (this.value === "@") this.value = "";
        });
    }

    if (whatsappCcInput && FORM_STRUCTURE_CONFIG.whatsapp !== null) {
        whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
    }
    if (whatsappLocalInput && FORM_STRUCTURE_CONFIG.whatsapp !== null) {
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
    Validación Dinámica y Envío
   ========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!registrosAbiertos) return;

    const formData = new URLSearchParams();

    // 1. Nombre
    if (FORM_STRUCTURE_CONFIG.name === null) {
        formData.append(fields.name, "null");
    } else {
        const nameVal = document.getElementById("name").value.trim();
        if (FORM_STRUCTURE_CONFIG.name && !nameVal) {
            showErrorModal("Campo incompleto", "Por favor, ingresa tu Nombre / Code Name.");
            return;
        }
        formData.append(fields.name, nameVal);
    }

    // 2. Email
    if (FORM_STRUCTURE_CONFIG.email === null) {
        formData.append(fields.email, "null");
    } else {
        const emailInput = document.getElementById("email");
        const emailVal = emailInput.value.trim();
        if (FORM_STRUCTURE_CONFIG.email && !emailVal) {
            showErrorModal("Campo incompleto", "Por favor, ingresa tu Correo electrónico.");
            return;
        }
        if (emailVal && !emailInput.checkValidity()) {
            showErrorModal("Correo inválido", "Por favor ingresa un correo válido, ejemplo: hola@gmail.com.");
            return;
        }
        formData.append(fields.email, emailVal);
    }

    // 3. Instagram
    if (FORM_STRUCTURE_CONFIG.instagram === null) {
        formData.append(fields.instagram, "null");
    } else {
        const instagramVal = instagramInput.value.trim();
        if (FORM_STRUCTURE_CONFIG.instagram && !instagramVal) {
            showErrorModal("Campo incompleto", "Por favor, ingresa tu cuenta de Instagram.");
            return;
        }
        if (instagramVal && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
            showErrorModal("Usuario de Instagram inválido", "Ingresa únicamente tu usuario de Instagram (@usuario).");
            return;
        }
        formData.append(fields.instagram, instagramVal);
    }

    // 4. WhatsApp
    if (FORM_STRUCTURE_CONFIG.whatsapp === null) {
        formData.append(fields.whatsapp, "null");
    } else {
        const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
        const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
        
        if (FORM_STRUCTURE_CONFIG.whatsapp && !localPuro) {
            showErrorModal("Campo incompleto", "Por favor, ingresa tu número de WhatsApp.");
            return;
        }
        if (localPuro.length > 0) {
            formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
        } else {
            formData.append(fields.whatsapp, "");
        }
    }

    // 5. Fechas (Checkbox)
    if (FORM_STRUCTURE_CONFIG.date === null) {
        formData.append(fields.date, "null");
    } else {
        const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
        if (FORM_STRUCTURE_CONFIG.date && checkedDates.length === 0) {
            showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
            return;
        }
        const listaFechas = Array.from(checkedDates).map(cb => cb.value);
        formData.append(fields.date, listaFechas.length > 0 ? listaFechas.join(", ") : "");
    }

    // 6. Géneros (Checkbox + Custom "Other")
    if (FORM_STRUCTURE_CONFIG.genres === null) {
        formData.append(fields.genres, "null");
    } else {
        const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
        if (FORM_STRUCTURE_CONFIG.genres && checkedGenres.length === 0) {
            showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical.");
            return;
        }
        if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
            showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido en la opción 'Other'.");
            return;
        }
        const listaGeneros = [];
        checkedGenres.forEach(cb => {
            if (cb.value === "__other_option__") {
                const valorOtro = otherText.value.trim();
                if (valorOtro) listaGeneros.push(valorOtro);
            } else {
                listaGeneros.push(cb.value);
            }
        });
        formData.append(fields.genres, listaGeneros.length > 0 ? listaGeneros.join(", ") : "");
    }

    // 7. Hora de Llegada (Radio)
    if (FORM_STRUCTURE_CONFIG.arrival === null) {
        formData.append(fields.arrival, "null");
    } else {
        const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
        if (FORM_STRUCTURE_CONFIG.arrival && !selectedArrival) {
            showErrorModal("Campo requerido", "Por favor indica tu hora estimada de llegada.");
            return;
        }
        formData.append(fields.arrival, selectedArrival ? selectedArrival.value : "");
    }

    // 8. Presupuesto (Radio)
    if (FORM_STRUCTURE_CONFIG.budget === null) {
        formData.append(fields.budget, "null");
    } else {
        const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');
        if (FORM_STRUCTURE_CONFIG.budget && !selectedBudget) {
            showErrorModal("Campo requerido", "Por favor indica tu presupuesto aproximado destinado a consumo.");
            return;
        }
        formData.append(fields.budget, selectedBudget ? selectedBudget.value : "");
    }

    // --- PROCESO DE ENVÍO ---
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









// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

// const fields = {
//     name: "entry.2061745721",       
//     date: "entry.2092361543",       
//     genres: "entry.1440434680",     
//     email: "entry.2006946810",      
//     instagram: "entry.1790059981",  
//     whatsapp: "entry.558799515",    
//     arrival: "entry.1054994475",    
//     budget: "entry.2095902647"      
// };

// /* ==========================================================================
//     BLOQUE DE CONFIGURACIÓN MAESTRO DE CAMPOS
//     Modifica los booleanos para alterar el comportamiento del formulario:
//     - visible: true/false -> Controla si la sección se renderiza en pantalla.
//     - obligatorio: true/false -> Define la validación y cambia automáticamente
//                                  el asterisco (*) por el tag (Opcional).
//    ========================================================================== */
// const CONFIGURACION_CAMPOS = {
//     name:      { visible: true, obligatorio: true },
//     email:     { visible: true, obligatorio: true },
//     date:      { visible: true, obligatorio: true },
//     genres:    { visible: true, obligatorio: true },
//     instagram: { visible: true, obligatorio: false },
//     whatsapp:  { visible: true, obligatorio: false },
//     arrival:   { visible: true, obligatorio: true },
//     budget:    { visible: true, obligatorio: true }
// };

// const CALENDAR_CONFIG = { year: 2026, month: 7, dayOfWeek: 5 };

// const GENRES_CONFIG = [
//     "House", "Techno", "Minimal", "Breaks y Bass", 
//     "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
// ];

// const ARRIVAL_CONFIG = [
//     "Inicio (17:00 - 19:00)",
//     "Punto Alto (19:00 - 21:00)",
//     "Cierre (21:00 en adelante)"
// ];

// const BUDGET_CONFIG = [
//     "Entre $80 MXN y $200 MXN",
//     "Entre $200 y $600 MXN",
//     "Más de $600 MXN"
// ];

// let registrosAbiertos = true; 

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
// const arrivalCheckboxGroup = document.getElementById("arrivalCheckboxGroup");
// const budgetCheckboxGroup = document.getElementById("budgetCheckboxGroup");

// let otherCheckbox = null;
// let otherText = null;

// if(form) { form.action = GOOGLE_FORM_ACTION; }

// function generarCheckboxesFechas() {
//     if (!datesCheckboxGroup) return;
//     const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
//     const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
//     const totalDiasEnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
//     let html = "";

//     for (let dia = 1; dia <= totalDiasEnMes; dia++) {
//         const fecha = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month - 1, dia);
//         if (fecha.getDay() === CALENDAR_CONFIG.dayOfWeek) {
//             const textoFecha = `${diasNombres[CALENDAR_CONFIG.dayOfWeek]} ${dia} de ${mesesNombres[CALENDAR_CONFIG.month - 1]}`;
//             html += `<label class="checkbox-item"><input type="checkbox" value="${textoFecha}"> ${textoFecha}</label>`;
//         }
//     }
//     datesCheckboxGroup.innerHTML = html;
// }

// function generarCheckboxesGeneros() {
//     if (!genresCheckboxGroup) return;
//     let html = "";
//     GENRES_CONFIG.forEach(genero => {
//         html += `<label class="checkbox-item"><input type="checkbox" value="${genero}"> ${genero}</label>`;
//     });
//     html += `
//         <div class="other-option-wrap">
//             <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Otro:</label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none; margin-top: 8px; width: 100%;">
//         </div>
//     `;
//     genresCheckboxGroup.innerHTML = html;

//     otherCheckbox = document.getElementById('otherCheckbox');
//     otherText = document.getElementById('otherText');

//     if (otherCheckbox && otherText) {
//         otherCheckbox.addEventListener('change', function() {
//             otherText.style.display = this.checked ? 'block' : 'none';
//             if (this.checked) otherText.focus();
//             else otherText.value = '';
//         });
//     }
// }

// function generarCheckboxesLlegada() {
//     if (!arrivalCheckboxGroup) return;
//     let html = "";
//     ARRIVAL_CONFIG.forEach(opcion => {
//         html += `<label class="checkbox-item"><input type="radio" name="arrival_radio" value="${opcion}"> ${opcion}</label>`;
//     });
//     arrivalCheckboxGroup.innerHTML = html;
// }

// function generarCheckboxesPresupuesto() {
//     if (!budgetCheckboxGroup) return;
//     let html = "";
//     BUDGET_CONFIG.forEach(opcion => {
//         html += `<label class="checkbox-item"><input type="radio" name="budget_radio" value="${opcion}"> ${opcion}</label>`;
//     });
//     budgetCheckboxGroup.innerHTML = html;
// }

// document.addEventListener("DOMContentLoaded", () => {
//     if (window.history.replaceState) {
//         window.history.replaceState(null, null, window.location.href);
//     }

//     generarCheckboxesFechas();
//     generarCheckboxesGeneros();
//     generarCheckboxesLlegada();
//     generarCheckboxesPresupuesto();

//     /* ----------------------------------------------------------------------
//        PROCESADOR MAESTRO DE INTERFAZ (Ocultar, Asteriscos y Opcionales)
//        ---------------------------------------------------------------------- */
//     Object.keys(CONFIGURACION_CAMPOS).forEach(llave => {
//         const config = CONFIGURACION_CAMPOS[llave];
//         const contenedor = document.querySelector(`[data-campo="${llave}"]`);
        
//         if (contenedor) {
//             // 1. Controlar Visibilidad de la sección
//             if (!config.visible) {
//                 contenedor.style.display = 'none';
//                 return; 
//             } else {
//                 contenedor.style.display = 'block';
//             }

//             // 2. Controlar Texto de Estado (* u Opcional) dinámicamente
//             const contenedorEstado = contenedor.querySelector('.indicador-estado');
//             if (contenedorEstado) {
//                 if (config.obligatorio) {
//                     contenedorEstado.innerHTML = '<span class="asterisco-obligatorio required">*</span>';
//                 } else {
//                     contenedorEstado.innerHTML = '<span class="optional-badge">(Opcional)</span>';
//                 }
//             }
//         }
//     });

//     if (instagramInput && CONFIGURACION_CAMPOS.instagram.visible) {
//         instagramInput.addEventListener("input", function() {
//             if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") this.value = "";
//         });
//     }

//     if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
//     if (whatsappLocalInput && CONFIGURACION_CAMPOS.whatsapp.visible) {
//         whatsappLocalInput.addEventListener("input", function() {
//             let num = this.value.replace(/\D/g, "").substring(0, 14);
//             let f = "";
//             if (num.length > 0) f += num.substring(0, 3);
//             if (num.length > 3) f += " " + num.substring(3, 6);
//             if (num.length > 6) f += " " + num.substring(6, 14);
//             this.value = f;
//         });
//     }
// });

// function showErrorModal(title, message) {
//     document.getElementById('modalTitle').innerText = title;
//     document.getElementById('modalMessage').innerText = message;
//     errorModal.showModal();
// }

// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     if (!registrosAbiertos) return;

//     const evaluarValidacion = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible && CONFIGURACION_CAMPOS[llave].obligatorio;
//     const esVisible = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible;

//     const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
//     const emailVal = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
//     const instagramVal = instagramInput ? instagramInput.value.trim() : "";

//     if (evaluarValidacion("name") && !nameVal) {
//         showErrorModal("Campo requerido", "Por favor, ingresa tu Nombre.");
//         return;
//     }

//     if (esVisible("email")) {
//         if (evaluarValidacion("email") && !emailVal) {
//             showErrorModal("Campo requerido", "Por favor, ingresa tu Correo electrónico.");
//             return;
//         }
//         const emailInput = document.getElementById("email");
//         if (emailVal && !emailInput.checkValidity()) {
//             showErrorModal("Correo inválido", "Por favor ingresa un correo válido.");
//             return;
//         }
//     }

//     if (esVisible("instagram") && instagramVal && instagramVal !== "@" && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
//         showErrorModal("Instagram inválido", "Ingresa únicamente tu usuario de Instagram.");
//         return;
//     }

//     if (evaluarValidacion("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedDates.length === 0) {
//             showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha.");
//             return;
//         }
//     }

//     if (evaluarValidacion("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedGenres.length === 0) {
//             showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical.");
//             return;
//         }
//     }

//     if (esVisible("genres") && otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//         showErrorModal("Especifica tu género", "Por favor, escribe tu género preferido.");
//         return;
//     }

//     const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
//     if (evaluarValidacion("arrival") && !selectedArrival) {
//         showErrorModal("Campo requerido", "Por favor indica tu hora estimada de llegada.");
//         return;
//     }

//     const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');
//     if (evaluarValidacion("budget") && !selectedBudget) {
//         showErrorModal("Campo requerido", "Por favor indica tu presupuesto aproximado.");
//         return;
//     }

//     const formData = new URLSearchParams();
//     formData.append(fields.name, esVisible("name") ? nameVal : "");
//     formData.append(fields.email, esVisible("email") ? emailVal : "");
//     formData.append(fields.instagram, (esVisible("instagram") && instagramVal !== "@") ? instagramVal : "");
//     formData.append(fields.arrival, (esVisible("arrival") && selectedArrival) ? selectedArrival.value : "");
//     formData.append(fields.budget, (esVisible("budget") && selectedBudget) ? selectedBudget.value : "");

//     if (esVisible("whatsapp") && whatsappLocalInput) {
//         const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//         const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
//         if (localPuro.length > 0) {
//             formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
//         } else {
//             formData.append(fields.whatsapp, "");
//         }
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     if (esVisible("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         const listaFechas = [];
//         checkedDates.forEach(cb => listaFechas.push(cb.value));
//         formData.append(fields.date, listaFechas.length > 0 ? listaFechas.join(", ") : "");
//     } else {
//         formData.append(fields.date, "");
//     }

//     if (esVisible("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         const listaGeneros = [];
//         checkedGenres.forEach(cb => {
//             if (cb.value === "__other_option__") {
//                 const valorOtro = otherText.value.trim();
//                 if (valorOtro) listaGeneros.push(valorOtro);
//             } else {
//                 listaGeneros.push(cb.value);
//             }
//         });
//         formData.append(fields.genres, listaGeneros.length > 0 ? listaGeneros.join(", ") : "");
//     } else {
//         formData.append(fields.genres, "");
//     }

//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         registerScreen.style.display = "none";
//         successScreen.style.display = "block";
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         form.reset();
//     } catch (error) {
//         console.error("Error:", error);
//         showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
//     }
// });

























// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

// const fields = {
//     name: "entry.2061745721",       // ID campo Nombre (Short Answer)
//     date: "entry.2092361543",       // ID campo Fechas (Short Answer)
//     genres: "entry.1440434680",     // ID campo Géneros (Short Answer)
//     email: "entry.2006946810",      // ID campo Email (Short Answer)
//     instagram: "entry.1790059981",  // ID campo Instagram (Short Answer)
//     whatsapp: "entry.558799515",    // ID campo WhatsApp (Short Answer)
//     arrival: "entry.1054994475",    // ID campo Hora de Llegada (Short Answer)
//     budget: "entry.2095902647"      // ID campo Presupuesto (Short Answer)
// };

// /* ==========================================================================
//     BLOQUE DE CONFIGURACIÓN MAESTRO DE CAMPOS
//     Modifica este bloque para controlar la UI y las validaciones:
//     - visible: false     -> Oculta la pregunta por completo y envía "" (null).
//     - obligatorio: false -> Muestra la pregunta sin asterisco (*) y permite enviarla vacía.
//    ========================================================================== */
// const CONFIGURACION_CAMPOS = {
//     name:      { visible: true, obligatorio: true },
//     email:     { visible: true, obligatorio: true },
//     date:      { visible: false, obligatorio: true },
//     genres:    { visible: true, obligatorio: false },
//     instagram: { visible: true, obligatorio: false },
//     whatsapp:  { visible: true, obligatorio: false },
//     arrival:   { visible: true, obligatorio: true },
//     budget:    { visible: true, obligatorio: true }
// };

// /* ==========================================================================
//     PARÁMETROS DEL CALENDARIO REUTILIZABLE
//    ========================================================================== */
// const CALENDAR_CONFIG = {
//     year: 2026,          
//     month: 7,            // 7 = Julio
//     dayOfWeek: 5         // 5 = Viernes
// };

// /* ==========================================================================
//     PARÁMETROS DE GÉNEROS REUTILIZABLES
//    ========================================================================== */
// const GENRES_CONFIG = [
//     "House", "Techno", "Minimal", "Breaks y Bass", 
//     "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
// ];

// /* ==========================================================================
//    PARÁMETROS LOGÍSTICOS REUTILIZABLES
//    ========================================================================== */
// const ARRIVAL_CONFIG = [
//     "Inicio (17:00 - 19:00)",
//     "Punto Alto (19:00 - 21:00)",
//     "Cierre (21:00 en adelante)"
// ];

// const BUDGET_CONFIG = [
//     "Entre $80 MXN y $200 MXN",
//     "Entre $200 y $600 MXN",
//     "Más de $600 MXN"
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
// const arrivalCheckboxGroup = document.getElementById("arrivalCheckboxGroup");
// const budgetCheckboxGroup = document.getElementById("budgetCheckboxGroup");

// let otherCheckbox = null;
// let otherText = null;

// if(form) { form.action = GOOGLE_FORM_ACTION; }

// /* ==========================================================================
//    Generadores Dinámicos de Interfaz
//    ========================================================================== */

// // 1. Generar Fechas del Calendario
// function generarCheckboxesFechas() {
//     if (!datesCheckboxGroup) return;
//     const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
//     const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

//     const totalDiasEnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
//     let html = "";

//     for (let dia = 1; dia <= totalDiasEnMes; dia++) {
//         const fecha = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month - 1, dia);
//         if (fecha.getDay() === CALENDAR_CONFIG.dayOfWeek) {
//             const textoFecha = `${diasNombres[CALENDAR_CONFIG.dayOfWeek]} ${dia} de ${mesesNombres[CALENDAR_CONFIG.month - 1]}`;
//             html += `
//                 <label class="checkbox-item">
//                     <input type="checkbox" value="${textoFecha}"> ${textoFecha}
//                 </label>
//             `;
//         }
//     }
//     datesCheckboxGroup.innerHTML = html;
// }

// // 2. Generar Lista de Géneros
// function generarCheckboxesGeneros() {
//     if (!genresCheckboxGroup) return;
//     let html = "";
    
//     GENRES_CONFIG.forEach(genero => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="checkbox" value="${genero}"> ${genero}
//             </label>
//         `;
//     });
    
//     html += `
//         <div class="other-option-wrap">
//             <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Other:</label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none;">
//         </div>
//     `;
//     genresCheckboxGroup.innerHTML = html;

//     otherCheckbox = document.getElementById('otherCheckbox');
//     otherText = document.getElementById('otherText');

//     if (otherCheckbox && otherText) {
//         otherCheckbox.addEventListener('change', function() {
//             otherText.style.display = this.checked ? 'block' : 'none';
//             if (this.checked) otherText.focus();
//             else otherText.value = '';
//         });
//     }
// }

// // 3. Generar Opciones de Llegada
// function generarCheckboxesLlegada() {
//     if (!arrivalCheckboxGroup) return;
//     let html = "";
    
//     ARRIVAL_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="arrival_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     arrivalCheckboxGroup.innerHTML = html;
// }

// // 4. Generar Opciones de Presupuesto
// function generarCheckboxesPresupuesto() {
//     if (!budgetCheckboxGroup) return;
//     let html = "";
    
//     BUDGET_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="budget_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     budgetCheckboxGroup.innerHTML = html;
// }

// /* ==========================================================================
//    Formatos Automáticos e Inicialización Dinámica del DOM
//    ========================================================================== */
// document.addEventListener("DOMContentLoaded", () => {

//     if (window.history.replaceState) {
//         window.history.replaceState(null, null, window.location.href);
//     }

//     // Renderizar los grupos de inputs dinámicos primero
//     generarCheckboxesFechas();
//     generarCheckboxesGeneros();
//     generarCheckboxesLlegada();
//     generarCheckboxesPresupuesto();

//     /* ----------------------------------------------------------------------
//        PROCESADOR MAESTRO DE INTERFAZ (Ocultar secciones y asteriscos)
//        ---------------------------------------------------------------------- */
//     Object.keys(CONFIGURACION_CAMPOS).forEach(llave => {
//         const config = CONFIGURACION_CAMPOS[llave];
//         const contenedor = document.querySelector(`[data-campo="${llave}"]`);
        
//         if (contenedor) {
//             // 1. Controlar Visibilidad del bloque completo
//             if (!config.visible) {
//                 contenedor.style.display = 'none';
//                 return; 
//             } else {
//                 contenedor.style.display = 'block';
//             }

//             // 2. Controlar Visibilidad del Asterisco Rojo
//             const asterisco = contenedor.querySelector('.asterisco-obligatorio');
//             if (asterisco) {
//                 asterisco.style.display = config.obligatorio ? 'inline' : 'none';
//             }
//         }
//     });

//     // Validaciones de formateo en tiempo de ejecución (Solo si están permitidos)
//     if (instagramInput && CONFIGURACION_CAMPOS.instagram.visible) {
//         instagramInput.addEventListener("input", function() {
//             if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") this.value = "";
//         });
//     }

//     if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
//     if (whatsappLocalInput && CONFIGURACION_CAMPOS.whatsapp.visible) {
//         whatsappLocalInput.addEventListener("input", function() {
//             let num = this.value.replace(/\D/g, "").substring(0, 14);
//             let f = "";
//             if (num.length > 0) f += num.substring(0, 3);
//             if (num.length > 3) f += " " + num.substring(3, 6);
//             if (num.length > 6) f += " " + num.substring(6, 14);
//             this.value = f;
//         });
//     }
// });

// function showErrorModal(title, message) {
//     document.getElementById('modalTitle').innerText = title;
//     document.getElementById('modalMessage').innerText = message;
//     errorModal.showModal();
// }

// /* ==========================================================================
//    Validación Inteligente Dinámica y Envío de Paquetes
//    ========================================================================== */
// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     if (!registrosAbiertos) return;

//     // Helpers booleanos de estado
//     const evaluarValidacion = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible && CONFIGURACION_CAMPOS[llave].obligatorio;
//     const esVisible = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible;

//     const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
//     const emailVal = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
//     const instagramVal = instagramInput ? instagramInput.value.trim() : "";

//     // --- PROCESAMIENTO ACTIVO DE VALIDACIONES CONDICIONALES ---

//     if (evaluarValidacion("name") && !nameVal) {
//         showErrorModal("Campo requerido", "Por favor, ingresa tu Nombre.");
//         return;
//     }

//     if (esVisible("email")) {
//         if (evaluarValidacion("email") && !emailVal) {
//             showErrorModal("Campo requerido", "Por favor, ingresa tu Correo electrónico.");
//             return;
//         }
//         const emailInput = document.getElementById("email");
//         if (emailVal && !emailInput.checkValidity()) {
//             showErrorModal("Correo inválido", "Por favor ingresa un correo válido, ejemplo: hola@gmail.com.");
//             return;
//         }
//     }

//     if (esVisible("instagram") && instagramVal && instagramVal !== "@" && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
//         showErrorModal("Usuario de Instagram inválido", "Ingresa únicamente tu usuario de Instagram.");
//         return;
//     }

//     if (evaluarValidacion("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedDates.length === 0) {
//             showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
//             return;
//         }
//     }

//     if (evaluarValidacion("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedGenres.length === 0) {
//             showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical.");
//             return;
//         }
//     }

//     if (esVisible("genres") && otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//         showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido.");
//         return;
//     }

//     const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
//     if (evaluarValidacion("arrival") && !selectedArrival) {
//         showErrorModal("Campo requerido", "Por favor indica tu hora estimada de llegada.");
//         return;
//     }

//     const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');
//     if (evaluarValidacion("budget") && !selectedBudget) {
//         showErrorModal("Campo requerido", "Por favor indica tu presupuesto aproximado.");
//         return;
//     }

//     // --- CONSTRUCCIÓN DEL PAYLOAD (URLSearchParams) ---
//     const formData = new URLSearchParams();
    
//     formData.append(fields.name, esVisible("name") ? nameVal : "");
//     formData.append(fields.email, esVisible("email") ? emailVal : "");
//     formData.append(fields.instagram, (esVisible("instagram") && instagramVal !== "@") ? instagramVal : "");
//     formData.append(fields.arrival, (esVisible("arrival") && selectedArrival) ? selectedArrival.value : "");
//     formData.append(fields.budget, (esVisible("budget") && selectedBudget) ? selectedBudget.value : "");

//     // WhatsApp
//     if (esVisible("whatsapp") && whatsappLocalInput) {
//         const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//         const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
//         if (localPuro.length > 0) {
//             formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
//         } else {
//             formData.append(fields.whatsapp, "");
//         }
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     // Fechas
//     if (esVisible("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         const listaFechas = [];
//         checkedDates.forEach(cb => listaFechas.push(cb.value));
//         formData.append(fields.date, listaFechas.length > 0 ? listaFechas.join(", ") : "");
//     } else {
//         formData.append(fields.date, "");
//     }

//     // Géneros
//     if (esVisible("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         const listaGeneros = [];
//         checkedGenres.forEach(cb => {
//             if (cb.value === "__other_option__") {
//                 const valorOtro = otherText.value.trim();
//                 if (valorOtro) listaGeneros.push(valorOtro);
//             } else {
//                 listaGeneros.push(cb.value);
//             }
//         });
//         formData.append(fields.genres, listaGeneros.length > 0 ? listaGeneros.join(", ") : "");
//     } else {
//         formData.append(fields.genres, "");
//     }

//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         registerScreen.style.display = "none";
//         successScreen.style.display = "block";
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         form.reset();
//     } catch (error) {
//         console.error("Error:", error);
//         showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
//     }
// });



// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

// const fields = {
//     name: "entry.2061745721",       // ID campo Nombre (Short Answer)
//     date: "entry.2092361543",       // ID campo Fechas (Short Answer)
//     genres: "entry.1440434680",     // ID campo Géneros (Short Answer)
//     email: "entry.2006946810",      // ID campo Email (Short Answer)
//     instagram: "entry.1790059981",  // ID campo Instagram (Short Answer)
//     whatsapp: "entry.558799515",    // ID campo WhatsApp (Short Answer)
//     arrival: "entry.1054994475",    // ID campo Hora de Llegada (Short Answer)
//     budget: "entry.2095902647"      // ID campo Presupuesto (Short Answer)
// };

// /* ==========================================================================
//      BLOQUE DE CONFIGURACIÓN MAESTRO DE CAMPOS
//     Aquí controlas de forma centralizada qué se muestra y qué se exige.
//     - visible: false     -> Oculta la pregunta y manda siempre "" (null) a Google.
//     - obligatorio: false -> El usuario puede dejarlo vacío sin que le marque error.
//    ========================================================================== */
// const CONFIGURACION_CAMPOS = {
//     name:      { visible: true, obligatorio: true },
//     email:     { visible: true, obligatorio: true },
//     date:      { visible: true, obligatorio: true },
//     genres:    { visible: true, obligatorio: false },
//     instagram: { visible: true, obligatorio: false },
//     whatsapp:  { visible: true, obligatorio: false },
//     arrival:   { visible: true, obligatorio: true },
//     budget:    { visible: true, obligatorio: false }
// };

// /* ==========================================================================
//     PARÁMETROS DEL CALENDARIO REUTILIZABLE
//    ========================================================================== */
// const CALENDAR_CONFIG = {
//     year: 2026,          
//     month: 7,            // 7 = Julio
//     dayOfWeek: 5         // 5 = Viernes
// };

// /* ==========================================================================
//     PARÁMETROS DE GÉNEROS REUTILIZABLES
//    ========================================================================== */
// const GENRES_CONFIG = [
//     "House", "Techno", "Minimal", "Breaks y Bass", 
//     "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
// ];

// /* ==========================================================================
//    PARÁMETROS LOGÍSTICOS REUTILIZABLES
//    ========================================================================== */
// const ARRIVAL_CONFIG = [
//     "Inicio (17:00 - 19:00)",
//     "Punto Alto (19:00 - 21:00)",
//     "Cierre (21:00 en adelante)"
// ];

// const BUDGET_CONFIG = [
//     "Entre $80 MXN y $200 MXN",
//     "Entre $200 y $600 MXN",
//     "Más de $600 MXN"
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
// const arrivalCheckboxGroup = document.getElementById("arrivalCheckboxGroup");
// const budgetCheckboxGroup = document.getElementById("budgetCheckboxGroup");

// let otherCheckbox = null;
// let otherText = null;

// if(form) { form.action = GOOGLE_FORM_ACTION; }

// /* ==========================================================================
//    Generadores Dinámicos de Interfaz y Lógica Ocultar/Mostrar
//    ========================================================================== */

// function gestionarVisibilidadSeccion(llaveConfig, elementoGrupo) {
//     if (!elementoGrupo) return false;
//     const contenedor = elementoGrupo.closest('.form-group') || elementoGrupo.parentElement;
//     if (!CONFIGURACION_CAMPOS[llaveConfig] || !CONFIGURACION_CAMPOS[llaveConfig].visible) {
//         if (contenedor) contenedor.style.display = 'none';
//         return false;
//     }
//     return true;
// }

// // 1. Generar Fechas del Calendario
// function generarCheckboxesFechas() {
//     if (!gestionarVisibilidadSeccion("date", datesCheckboxGroup)) return;
//     const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
//     const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

//     const totalDiasEnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
//     let html = "";

//     for (let dia = 1; dia <= totalDiasEnMes; dia++) {
//         const fecha = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month - 1, dia);
//         if (fecha.getDay() === CALENDAR_CONFIG.dayOfWeek) {
//             const textoFecha = `${diasNombres[CALENDAR_CONFIG.dayOfWeek]} ${dia} de ${mesesNombres[CALENDAR_CONFIG.month - 1]}`;
//             html += `
//                 <label class="checkbox-item">
//                     <input type="checkbox" value="${textoFecha}"> ${textoFecha}
//                 </label>
//             `;
//         }
//     }
//     datesCheckboxGroup.innerHTML = html;
// }

// // 2. Generar Lista de Géneros
// function generarCheckboxesGeneros() {
//     if (!gestionarVisibilidadSeccion("genres", genresCheckboxGroup)) return;
//     let html = "";
    
//     GENRES_CONFIG.forEach(genero => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="checkbox" value="${genero}"> ${genero}
//             </label>
//         `;
//     });
    
//     html += `
//         <div class="other-option-wrap">
//             <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Other:</label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none;">
//         </div>
//     `;
//     genresCheckboxGroup.innerHTML = html;

//     otherCheckbox = document.getElementById('otherCheckbox');
//     otherText = document.getElementById('otherText');

//     if (otherCheckbox && otherText) {
//         otherCheckbox.addEventListener('change', function() {
//             otherText.style.display = this.checked ? 'block' : 'none';
//             if (this.checked) otherText.focus();
//             else otherText.value = '';
//         });
//     }
// }

// // 3. Generar Opciones de Llegada
// function generarCheckboxesLlegada() {
//     if (!gestionarVisibilidadSeccion("arrival", arrivalCheckboxGroup)) return;
//     let html = "";
    
//     ARRIVAL_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="arrival_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     arrivalCheckboxGroup.innerHTML = html;
// }

// // 4. Generar Opciones de Presupuesto
// function generarCheckboxesPresupuesto() {
//     if (!gestionarVisibilidadSeccion("budget", budgetCheckboxGroup)) return;
//     let html = "";
    
//     BUDGET_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="budget_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     budgetCheckboxGroup.innerHTML = html;
// }

// /* =========================
//    Formatos Automáticos e Inicialización
// ========================= */
// document.addEventListener("DOMContentLoaded", () => {

//     if (window.history.replaceState) {
//         window.history.replaceState(null, null, window.location.href);
//     }

//     // Ocultar inputs directos de HTML basados en el bloque maestro de configuración
//     if ((!CONFIGURACION_CAMPOS.name || !CONFIGURACION_CAMPOS.name.visible) && document.getElementById("name")) document.getElementById("name").closest('.form-group')?.style.setProperty('display', 'none');
//     if ((!CONFIGURACION_CAMPOS.email || !CONFIGURACION_CAMPOS.email.visible) && document.getElementById("email")) document.getElementById("email").closest('.form-group')?.style.setProperty('display', 'none');
//     if ((!CONFIGURACION_CAMPOS.instagram || !CONFIGURACION_CAMPOS.instagram.visible) && instagramInput) instagramInput.closest('.form-group')?.style.setProperty('display', 'none');
//     if ((!CONFIGURACION_CAMPOS.whatsapp || !CONFIGURACION_CAMPOS.whatsapp.visible) && whatsappLocalInput) whatsappLocalInput.closest('.form-group')?.style.setProperty('display', 'none');

//     generarCheckboxesFechas();
//     generarCheckboxesGeneros();
//     generarCheckboxesLlegada();
//     generarCheckboxesPresupuesto();

//     if (instagramInput && CONFIGURACION_CAMPOS.instagram.visible) {
//         instagramInput.addEventListener("input", function() {
//             if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") this.value = "";
//         });
//     }

//     if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
//     if (whatsappLocalInput && CONFIGURACION_CAMPOS.whatsapp.visible) {
//         whatsappLocalInput.addEventListener("input", function() {
//             let num = this.value.replace(/\D/g, "").substring(0, 14);
//             let f = "";
//             if (num.length > 0) f += num.substring(0, 3);
//             if (num.length > 3) f += " " + num.substring(3, 6);
//             if (num.length > 6) f += " " + num.substring(6, 14);
//             this.value = f;
//         });
//     }
// });

// function showErrorModal(title, message) {
//     document.getElementById('modalTitle').innerText = title;
//     document.getElementById('modalMessage').innerText = message;
//     errorModal.showModal();
// }

// /* =========================
//    Validación Inteligente Dinámica y Envío
// ========================= */
// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     if (!registrosAbiertos) return;

//     // Helper interno para saber si un campo requiere ser validado obligatoriamente
//     const evaluarValidacion = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible && CONFIGURACION_CAMPOS[llave].obligatorio;
//     const esVisible = (llave) => CONFIGURACION_CAMPOS[llave] && CONFIGURACION_CAMPOS[llave].visible;

//     const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
//     const emailVal = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
//     const instagramVal = instagramInput ? instagramInput.value.trim() : "";

//     // --- PROCESADOR DINÁMICO DE VALIDACIONES ---

//     if (evaluarValidacion("name") && !nameVal) {
//         showErrorModal("Campo requerido", "Por favor, ingresa tu Nombre.");
//         return;
//     }

//     if (esVisible("email")) {
//         if (evaluarValidacion("email") && !emailVal) {
//             showErrorModal("Campo requerido", "Por favor, ingresa tu Correo electrónico.");
//             return;
//         }
//         const emailInput = document.getElementById("email");
//         if (emailVal && !emailInput.checkValidity()) {
//             showErrorModal("Correo inválido", "Por favor ingresa un correo válido, ejemplo: hola@gmail.com.");
//             return;
//         }
//     }

//     if (esVisible("instagram") && instagramVal && instagramVal !== "@" && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
//         showErrorModal("Usuario de Instagram inválido", "Ingresa únicamente tu usuario de Instagram.");
//         return;
//     }

//     if (evaluarValidacion("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedDates.length === 0) {
//             showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
//             return;
//         }
//     }

//     if (evaluarValidacion("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedGenres.length === 0) {
//             showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical de la lista.");
//             return;
//         }
//     }

//     if (esVisible("genres") && otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//         showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido.");
//         return;
//     }

//     const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
//     if (evaluarValidacion("arrival") && !selectedArrival) {
//         showErrorModal("Campo requerido", "Por favor indica tu hora estimada de llegada.");
//         return;
//     }

//     const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');
//     if (evaluarValidacion("budget") && !selectedBudget) {
//         showErrorModal("Campo requerido", "Por favor indica tu presupuesto aproximado.");
//         return;
//     }

//     // --- CONSTRUCCIÓN INTELIGENTE DEL PACKET DATA ---
//     const formData = new URLSearchParams();
    
//     formData.append(fields.name, esVisible("name") ? nameVal : "");
//     formData.append(fields.email, esVisible("email") ? emailVal : "");
//     formData.append(fields.instagram, (esVisible("instagram") && instagramVal !== "@") ? instagramVal : "");
//     formData.append(fields.arrival, (esVisible("arrival") && selectedArrival) ? selectedArrival.value : "");
//     formData.append(fields.budget, (esVisible("budget") && selectedBudget) ? selectedBudget.value : "");

//     // WhatsApp
//     if (esVisible("whatsapp") && whatsappLocalInput) {
//         const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//         const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
//         if (localPuro.length > 0) {
//             formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
//         } else {
//             formData.append(fields.whatsapp, "");
//         }
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     // Fechas
//     if (esVisible("date")) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         const listaFechas = [];
//         checkedDates.forEach(cb => listaFechas.push(cb.value));
//         formData.append(fields.date, listaFechas.length > 0 ? listaFechas.join(", ") : "");
//     } else {
//         formData.append(fields.date, "");
//     }

//     // Géneros
//     if (esVisible("genres")) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         const listaGeneros = [];
//         checkedGenres.forEach(cb => {
//             if (cb.value === "__other_option__") {
//                 const valorOtro = otherText.value.trim();
//                 if (valorOtro) listaGeneros.push(valorOtro);
//             } else {
//                 listaGeneros.push(cb.value);
//             }
//         });
//         formData.append(fields.genres, listaGeneros.length > 0 ? listaGeneros.join(", ") : "");
//     } else {
//         formData.append(fields.genres, "");
//     }

//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         registerScreen.style.display = "none";
//         successScreen.style.display = "block";
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         form.reset();
//     } catch (error) {
//         console.error("Error:", error);
//         showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
//     }
// });









// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

// const fields = {
//     name: "entry.2061745721",       // ID campo Nombre (Short Answer)
//     date: "entry.2092361543",       // ID campo Fechas (Short Answer)
//     genres: "entry.1440434680",     // ID campo Géneros (Short Answer)
//     email: "entry.2006946810",      // ID campo Email (Short Answer)
//     instagram: "entry.1790059981",  // ID campo Instagram (Short Answer)
//     whatsapp: "entry.558799515",    // ID campo WhatsApp (Short Answer)
//     arrival: "entry.1054994475",    // ID campo Hora de Llegada (Short Answer)
//     budget: "entry.2095902647"      // ID campo Presupuesto (Short Answer)
// };

// /* ==========================================================================
//     CONTROL DE VISIBILIDAD DE PREGUNTAS (Configuración global)
//     Cambia a false la sección que desees ocultar por completo.
//    ========================================================================== */
// const VISIBLE_SECTIONS = {
//     name: true,
//     email: true,
//     date: false,
//     genres: true,
//     instagram: true,
//     whatsapp: true,
//     arrival: true,  // Si es false, se oculta y envía vacío/null
//     budget: true    // Si es false, se oculta y envía vacío/null
// };

// /* ==========================================================================
//     PARÁMETROS DEL CALENDARIO REUTILIZABLE
//    ========================================================================== */
// const CALENDAR_CONFIG = {
//     year: 2026,          
//     month: 7,            // 7 = Julio
//     dayOfWeek: 5         // 5 = Viernes
// };

// /* ==========================================================================
//     PARÁMETROS DE GÉNEROS REUTILIZABLES
//    ========================================================================== */
// const GENRES_CONFIG = [
//     "House", "Techno", "Minimal", "Breaks y Bass", 
//     "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
// ];

// /* ==========================================================================
//    PARÁMETROS LOGÍSTICOS REUTILIZABLES
//    ========================================================================== */
// const ARRIVAL_CONFIG = [
//     "Inicio (17:00 - 19:00)",
//     "Punto Alto (19:00 - 21:00)",
//     "Cierre (21:00 en adelante)"
// ];

// const BUDGET_CONFIG = [
//     "Entre $80 MXN y $200 MXN",
//     "Entre $200 y $600 MXN",
//     "Más de $600 MXN"
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
// const arrivalCheckboxGroup = document.getElementById("arrivalCheckboxGroup");
// const budgetCheckboxGroup = document.getElementById("budgetCheckboxGroup");

// let otherCheckbox = null;
// let otherText = null;

// if(form) { form.action = GOOGLE_FORM_ACTION; }

// /* ==========================================================================
//    Generadores Dinámicos de Interfaz y Control de Visibilidad
//    ========================================================================== */

// // Función Helper para ocultar contenedores del DOM dinámicamente
// function gestionarVisibilidadSeccion(llaveConfig, elementoGrupo) {
//     if (!elementoGrupo) return false;
//     // Busca el contenedor padre (usualmente un fieldset, div.form-group o similar)
//     const contenedor = elementoGrupo.closest('.form-group') || elementoGrupo.parentElement;
//     if (!VISIBLE_SECTIONS[llaveConfig]) {
//         if (contenedor) contenedor.style.display = 'none';
//         return false;
//     }
//     return true;
// }

// // 1. Generar Fechas del Calendario
// function generarCheckboxesFechas() {
//     if (!gestionarVisibilidadSeccion("date", datesCheckboxGroup)) return;
//     const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
//     const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

//     const totalDiasEnMes = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month, 0).getDate();
//     let html = "";

//     for (let dia = 1; dia <= totalDiasEnMes; dia++) {
//         const fecha = new Date(CALENDAR_CONFIG.year, CALENDAR_CONFIG.month - 1, dia);
//         if (fecha.getDay() === CALENDAR_CONFIG.dayOfWeek) {
//             const textoFecha = `${diasNombres[CALENDAR_CONFIG.dayOfWeek]} ${dia} de ${mesesNombres[CALENDAR_CONFIG.month - 1]}`;
//             html += `
//                 <label class="checkbox-item">
//                     <input type="checkbox" value="${textoFecha}"> ${textoFecha}
//                 </label>
//             `;
//         }
//     }
//     datesCheckboxGroup.innerHTML = html;
// }

// // 2. Generar Lista de Géneros
// function generarCheckboxesGeneros() {
//     if (!gestionarVisibilidadSeccion("genres", genresCheckboxGroup)) return;
//     let html = "";
    
//     GENRES_CONFIG.forEach(genero => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="checkbox" value="${genero}"> ${genero}
//             </label>
//         `;
//     });
    
//     html += `
//         <div class="other-option-wrap">
//             <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Other:</label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none;">
//         </div>
//     `;
//     genresCheckboxGroup.innerHTML = html;

//     otherCheckbox = document.getElementById('otherCheckbox');
//     otherText = document.getElementById('otherText');

//     if (otherCheckbox && otherText) {
//         otherCheckbox.addEventListener('change', function() {
//             otherText.style.display = this.checked ? 'block' : 'none';
//             if (this.checked) otherText.focus();
//             else otherText.value = '';
//         });
//     }
// }

// // 3. Generar Opciones de Llegada
// function generarCheckboxesLlegada() {
//     if (!gestionarVisibilidadSeccion("arrival", arrivalCheckboxGroup)) return;
//     let html = "";
    
//     ARRIVAL_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="arrival_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     arrivalCheckboxGroup.innerHTML = html;
// }

// // 4. Generar Opciones de Presupuesto
// function generarCheckboxesPresupuesto() {
//     if (!gestionarVisibilidadSeccion("budget", budgetCheckboxGroup)) return;
//     let html = "";
    
//     BUDGET_CONFIG.forEach(opcion => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="budget_radio" value="${opcion}"> ${opcion}
//             </label>
//         `;
//     });
    
//     budgetCheckboxGroup.innerHTML = html;
// }

// /* =========================
//    Formatos Automáticos e Inicialización
// ========================= */
// document.addEventListener("DOMContentLoaded", () => {

//     if (window.history.replaceState) {
//         window.history.replaceState(null, null, window.location.href);
//     }

//     // Ocultar inputs nativos fijos si están deshabilitados en la config
//     if (!VISIBLE_SECTIONS.name && document.getElementById("name")) document.getElementById("name").closest('.form-group')?.style.setProperty('display', 'none');
//     if (!VISIBLE_SECTIONS.email && document.getElementById("email")) document.getElementById("email").closest('.form-group')?.style.setProperty('display', 'none');
//     if (!VISIBLE_SECTIONS.instagram && instagramInput) instagramInput.closest('.form-group')?.style.setProperty('display', 'none');
//     if (!VISIBLE_SECTIONS.whatsapp && whatsappLocalInput) whatsappLocalInput.closest('.form-group')?.style.setProperty('display', 'none');

//     generarCheckboxesFechas();
//     generarCheckboxesGeneros();
//     generarCheckboxesLlegada();
//     generarCheckboxesPresupuesto();

//     if (instagramInput && VISIBLE_SECTIONS.instagram) {
//         instagramInput.addEventListener("input", function() {
//             if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") this.value = "";
//         });
//     }

//     if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
//     if (whatsappLocalInput && VISIBLE_SECTIONS.whatsapp) {
//         whatsappLocalInput.addEventListener("input", function() {
//             let num = this.value.replace(/\D/g, "").substring(0, 14);
//             let f = "";
//             if (num.length > 0) f += num.substring(0, 3);
//             if (num.length > 3) f += " " + num.substring(3, 6);
//             if (num.length > 6) f += " " + num.substring(6, 14);
//             this.value = f;
//         });
//     }
// });

// function showErrorModal(title, message) {
//     document.getElementById('modalTitle').innerText = title;
//     document.getElementById('modalMessage').innerText = message;
//     errorModal.showModal();
// }

// /* =========================
//    Validación y Envío (Pipeline ETL con Soporte de Ocultado)
// ========================= */
// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     if (!registrosAbiertos) return;

//     const nameVal = document.getElementById("name").value.trim();
//     const emailVal = document.getElementById("email").value.trim();
//     const instagramVal = instagramInput.value.trim();

//     // --- VALIDACIONES CONDICIONALES BASADAS EN CONFIGURACIÓN ---
    
//     if (VISIBLE_SECTIONS.name && !nameVal) {
//         showErrorModal("Campos incompletos", "Por favor, ingresa tu Nombre.");
//         return;
//     }

//     if (VISIBLE_SECTIONS.email) {
//         if (!emailVal) {
//             showErrorModal("Campos incompletos", "Por favor, ingresa tu Correo electrónico.");
//             return;
//         }
//         const emailInput = document.getElementById("email");
//         if (!emailInput.checkValidity()) {
//             showErrorModal("Correo inválido", "Por favor ingresa un correo válido, ejemplo: hola@gmail.com.");
//             return;
//         }
//     }

//     if (VISIBLE_SECTIONS.instagram && instagramVal && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
//         showErrorModal("Usuario de Instagram inválido", "Ingresa únicamente tu usuario de Instagram.");
//         return;
//     }

//     if (VISIBLE_SECTIONS.date) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedDates.length === 0) {
//             showErrorModal("Selecciona una fecha", "Por favor, elige al menos una fecha para asistir.");
//             return;
//         }
//     }

//     if (VISIBLE_SECTIONS.genres) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         if (checkedGenres.length === 0) {
//             showErrorModal("Selecciona un género", "Por favor, elige al menos un género musical.");
//             return;
//         }
//         if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//             showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido.");
//             return;
//         }
//     }

//     const selectedArrival = document.querySelector('input[name="arrival_radio"]:checked');
//     if (VISIBLE_SECTIONS.arrival && !selectedArrival) {
//         showErrorModal("Campos requeridos", "Por favor indica tu hora estimada de llegada.");
//         return;
//     }

//     const selectedBudget = document.querySelector('input[name="budget_radio"]:checked');
//     if (VISIBLE_SECTIONS.budget && !selectedBudget) {
//         showErrorModal("Campos requeridos", "Por favor indica tu presupuesto aproximado.");
//         return;
//     }

//     // --- CONSTRUCCIÓN DEL DATA PACKET ---
//     const formData = new URLSearchParams();
    
//     // Inyección de Datos con lógica Fallback Null/Empty String para campos deshabilitados
//     formData.append(fields.name, VISIBLE_SECTIONS.name ? nameVal : "");
//     formData.append(fields.email, VISIBLE_SECTIONS.email ? emailVal : "");
//     formData.append(fields.instagram, VISIBLE_SECTIONS.instagram ? instagramVal : "");
//     formData.append(fields.arrival, VISIBLE_SECTIONS.arrival ? selectedArrival.value : "");
//     formData.append(fields.budget, VISIBLE_SECTIONS.budget ? selectedBudget.value : "");

//     // Formatear WhatsApp
//     if (VISIBLE_SECTIONS.whatsapp) {
//         const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//         const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
//         if (localPuro.length > 0) {
//             formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
//         } else {
//             formData.append(fields.whatsapp, "");
//         }
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     // Procesar fechas
//     if (VISIBLE_SECTIONS.date) {
//         const checkedDates = document.querySelectorAll('#datesCheckboxGroup input[type="checkbox"]:checked');
//         const listaFechas = [];
//         checkedDates.forEach(cb => listaFechas.push(cb.value));
//         formData.append(fields.date, listaFechas.join(", "));
//     } else {
//         formData.append(fields.date, "");
//     }

//     // Procesar géneros
//     if (VISIBLE_SECTIONS.genres) {
//         const checkedGenres = document.querySelectorAll('#genresCheckboxGroup input[type="checkbox"]:checked');
//         const listaGeneros = [];
//         checkedGenres.forEach(cb => {
//             if (cb.value === "__other_option__") {
//                 const valorOtro = otherText.value.trim();
//                 if (valorOtro) listaGeneros.push(valorOtro);
//             } else {
//                 listaGeneros.push(cb.value);
//             }
//         });
//         formData.append(fields.genres, listaGeneros.join(", "));
//     } else {
//         formData.append(fields.genres, "");
//     }

//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         registerScreen.style.display = "none";
//         successScreen.style.display = "block";
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         form.reset();
//     } catch (error) {
//         console.error("Error:", error);
//         showErrorModal("Error de conexión", "Hubo un problem de red. Inténtalo de nuevo.");
//     }
// });