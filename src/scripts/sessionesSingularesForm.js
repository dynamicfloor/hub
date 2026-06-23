const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdXL0kxs0k4_5XhOuxsEyxVyvY4oNfY67LLd9X4mlf8Nmx5NQ/formResponse";
// https://docs.google.com/forms/d/e/1FAIpQLSdXL0kxs0k4_5XhOuxsEyxVyvY4oNfY67LLd9X4mlf8Nmx5NQ/viewform?usp=header

const fields = {
    name: "entry.1784247829",
    punctuality: "entry.1779102809",
    attendance: "entry.922373883",
    experiences: "entry.288653364", 
    email: "entry.757878290",
    genres: "entry.571651837",
    instagram: "entry.101075939",
    whatsapp: "entry.148486196"
};

const PUNCTUALITY_CONFIG = ["Sí, claro", "Trataré", "No, es seguro"];
const ATTENDANCE_CONFIG = ["Certeza total", "Es probable", "Depende de mis horarios"];

const EXPERIENCES_CONFIG = [
    "Deriva Acuatica (Electronica sobre Agua II)", 
    "Sobre Ruedas (Electronica sobre ruedas I)", 
];

const GENRES_CONFIG = [
    "House", "Techno", "Minimal", "Breaks y Bass", 
    "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
];

let registrosAbiertos = true; 
let selectedExperiences = [];

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

const punctualityRadioGroup = document.getElementById("punctualityRadioGroup");
const attendanceRadioGroup = document.getElementById("attendanceRadioGroup");
const genresCheckboxGroup = document.getElementById("genresCheckboxGroup");

let otherCheckbox = null;
let otherText = null;

if (form) { form.action = GOOGLE_FORM_ACTION; }

/* ==========================================================================
   Generadores Dinámicos de Interfaz
   ========================================================================== */

function generarRadioPuntualidad() {
    if (!punctualityRadioGroup) return;
    let html = "";
    PUNCTUALITY_CONFIG.forEach((opcion, index) => {
        html += `
            <label class="checkbox-item">
                <input type="radio" name="punctuality_radio" value="${opcion}" ${index === 0 ? 'checked' : ''}> ${opcion}
            </label>
        `;
    });
    punctualityRadioGroup.innerHTML = html;
}

function generarRadioAsistencia() {
    if (!attendanceRadioGroup) return;
    let html = "";
    ATTENDANCE_CONFIG.forEach((opcion, index) => {
        html += `
            <label class="checkbox-item">
                <input type="radio" name="attendance_radio" value="${opcion}" ${index === 0 ? 'checked' : ''}> ${opcion}
            </label>
        `;
    });
    attendanceRadioGroup.innerHTML = html;
}

function generarCheckboxesGeneros() {
    if (!genresCheckboxGroup) return;
    let html = "";
    GENRES_CONFIG.forEach(genero => {
        html += `
            <label class="checkbox-item">
                <input type="checkbox" name="genres_cb" value="${genero}"> ${genero}
            </label>
        `;
    });
    html += `
        <div class="other-option-wrap" style="margin-top: 8px;">
            <label class="checkbox-item"><input type="checkbox" value="__other_option__" id="otherCheckbox"> Otro:</label>
            <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none; margin-top: 6px; width: 100%;">
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

/* ==========================================================================
   LÓGICA DEL BUSCADOR / COMBOBOX (EXPERIENCIAS) PROTEGIDA
   ========================================================================== */
function inicializarBuscadorExperiencias() {
    // Buscar los elementos dentro de la función para asegurar que el DOM ya exista
    const experiencesSearch = document.getElementById("experiencesSearch");
    const experiencesDropdown = document.getElementById("experiencesDropdown");
    const experiencesTagsContainer = document.getElementById("experiencesTagsContainer");

    // Si el HTML no ha sido actualizado aún con los nuevos IDs, salimos pacíficamente sin romper el script
    if (!experiencesSearch || !experiencesDropdown || !experiencesTagsContainer) return;

    function renderDropdown(filtro = "") {
        const query = filtro.toLowerCase().trim();
        const opcionesFiltradas = EXPERIENCES_CONFIG.filter(exp => 
            exp.toLowerCase().includes(query) && !selectedExperiences.includes(exp)
        );

        if (opcionesFiltradas.length === 0) {
            experiencesDropdown.innerHTML = `<div class="dropdown-item option-disabled" style="padding: 10px; color: var(--muted); font-size: 14px;">No se encontraron resultados</div>`;
            return;
        }

        let html = "";
        opcionesFiltradas.forEach(opcion => {
            html += `<div class="dropdown-item" data-value="${opcion}" style="padding: 10px; cursor: pointer;">${opcion}</div>`;
        });
        experiencesDropdown.innerHTML = html;

        experiencesDropdown.querySelectorAll(".dropdown-item[data-value]").forEach(item => {
            item.addEventListener("click", function() {
                const valor = this.getAttribute("data-value");
                addExperienceTag(valor);
                experiencesSearch.value = "";
                renderDropdown("");
                experiencesDropdown.style.display = "none";
            });
        });
    }

    function addExperienceTag(valor) {
        if (!selectedExperiences.includes(valor)) {
            selectedExperiences.push(valor);
            renderTags();
        }
    }

    function renderTags() {
        let html = "";
        selectedExperiences.forEach(exp => {
            html += `
                <span class="tag-item">
                    ${exp}
                    <span class="tag-close" data-value="${exp}">&times;</span>
                </span>
            `;
        });
        experiencesTagsContainer.innerHTML = html;

        experiencesTagsContainer.querySelectorAll(".tag-close").forEach(btn => {
            btn.addEventListener("click", function() {
                const valorAEliminar = this.getAttribute("data-value");
                selectedExperiences = selectedExperiences.filter(e => e !== valorAEliminar);
                renderTags();
                renderDropdown(experiencesSearch.value);
            });
        });
    }

    experiencesSearch.addEventListener("focus", () => {
        renderDropdown(experiencesSearch.value);
        experiencesDropdown.style.display = "block";
    });

    experiencesSearch.addEventListener("input", (e) => {
        renderDropdown(e.target.value);
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".custom-select-container")) {
            experiencesDropdown.style.display = "none";
        }
    });
}

/* =========================
   Formatos Automáticos e Inicialización Segura
========================= */
document.addEventListener("DOMContentLoaded", () => {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    // Ejecuciones aisladas e independientes
    generarRadioPuntualidad();
    generarRadioAsistencia();
    generarCheckboxesGeneros();
    inicializarBuscadorExperiencias(); 

    // Formateadores de entradas opcionales
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
   Validación y Envío 
========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!registrosAbiertos) return;

    const nameVal = document.getElementById("name").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const instagramVal = instagramInput ? instagramInput.value.trim() : "";

    if (!nameVal || !emailVal) {
        showErrorModal("Campos incompletos", "Por favor, ingresa tu Nombre y tu Correo electrónico.");
        return;
    }

    const emailInput = document.getElementById("email");
    if (!emailInput.checkValidity()) {
        showErrorModal("Correo inválido", "Por favor ingresa un correo válido.");
        return;
    }

    const selectedPunctuality = document.querySelector('input[name="punctuality_radio"]:checked');
    const selectedAttendance = document.querySelector('input[name="attendance_radio"]:checked');
    if (!selectedPunctuality || !selectedAttendance) {
        showErrorModal("Campos requeridos", "Por favor responde las preguntas sobre puntualidad y certeza de asistencia.");
        return;
    }

    // Validación del buscador dinámico
    if (document.getElementById("experiencesSearch") && selectedExperiences.length === 0) {
        showErrorModal("Selecciona una opción", "Por favor, busca y selecciona al menos una experiencia de interés.");
        return;
    }

    const checkedGenres = document.querySelectorAll('input[name="genres_cb"]:checked');
    if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
        showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido.");
        return;
    }

    if (instagramVal && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
        showErrorModal("Usuario de Instagram inválido", "Ingresa un usuario válido o deja el campo vacío.");
        return;
    }

    // --- CONSTRUCCIÓN DEL DATA PACKET ---
    const formData = new URLSearchParams();
    formData.append(fields.name, nameVal);
    formData.append(fields.email, emailVal);
    formData.append(fields.instagram, instagramVal);
    formData.append(fields.punctuality, selectedPunctuality.value);
    formData.append(fields.attendance, selectedAttendance.value);

    if (whatsappCcInput && whatsappLocalInput) {
        const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
        const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
        if (localPuro.length > 0) {
            formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
        } else {
            formData.append(fields.whatsapp, "");
        }
    }

    formData.append(fields.experiences, selectedExperiences.join(", "));

    const listaGeneros = [];
    checkedGenres.forEach(cb => listaGeneros.push(cb.value));
    if (otherCheckbox && otherCheckbox.checked) {
        const valorOtro = otherText.value.trim();
        if (valorOtro) listaGeneros.push(valorOtro);
    }
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
        
        selectedExperiences = [];
        const tagsContainer = document.getElementById("experiencesTagsContainer");
        if (tagsContainer) tagsContainer.innerHTML = "";
        form.reset();
    } catch (error) {
        console.error("Error:", error);
        showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
    }
});




// const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdMYTVmcyAs3si0XKIe6m_3q23x5TGRAShaVG-TeNWNmhZbYQ/formResponse";

// const fields = {
//     name: "entry.2061745721",            // ID campo Nombre (Short Answer)
//     punctuality: "entry.1054994475",     // ID adaptado para "¿Puedes llegar puntual?" (Antes arrival)
//     attendance: "entry.2095902647",      // ID adaptado para "¿Tienes la certeza de asistir?" (Antes budget)
//     experiences: "entry.2092361543",     // ID adaptado para "Experiencias de interés" (Antes date)
//     email: "entry.2006946810",           // ID campo Email (Short Answer)
//     genres: "entry.1440434680",          // ID campo Géneros (Short Answer)
//     instagram: "entry.1790059981",       // ID campo Instagram (Short Answer)
//     whatsapp: "entry.558799515"          // ID campo WhatsApp (Short Answer)
// };

// /* ==========================================================================
//    CONFIGURACIONES REUTILIZABLES (Alineadas al HTML)
//    ========================================================================== */
// const PUNCTUALITY_CONFIG = [
//     "Sí, claro", 
//     "Trataré", 
//     "No estoy seguro (a)"
// ];

// const ATTENDANCE_CONFIG = [
//     "Certeza total", 
//     "Es probable", 
//     "Depende de mis horarios"
// ];

// const EXPERIENCES_CONFIG = [
//     "Deriva Acuatica", 
//     "Sobre Ruedas" 
// ];

// const GENRES_CONFIG = [
//     "House", "Techno", "Minimal", "Breaks y Bass", 
//     "Ambient y Experimental", "Disco y Funk", "Global y Orgánico"
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

// // Contenedores según los nuevos IDs del HTML
// const punctualityRadioGroup = document.getElementById("punctualityRadioGroup");
// const attendanceRadioGroup = document.getElementById("attendanceRadioGroup");
// const experiencesCheckboxGroup = document.getElementById("experiencesCheckboxGroup");
// const genresCheckboxGroup = document.getElementById("genresCheckboxGroup");

// let otherCheckbox = null;
// let otherText = null;

// if (form) { form.action = GOOGLE_FORM_ACTION; }

// /* ==========================================================================
//    Generadores Dinámicos de Interfaz
//    ========================================================================== */

// function generarRadioPuntualidad() {
//     if (!punctualityRadioGroup) return;
//     let html = "";
//     PUNCTUALITY_CONFIG.forEach((opcion, index) => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="punctuality_radio" value="${opcion}" ${index === 0 ? 'checked' : ''}> ${opcion}
//             </label>
//         `;
//     });
//     punctualityRadioGroup.innerHTML = html;
// }

// function generarRadioAsistencia() {
//     if (!attendanceRadioGroup) return;
//     let html = "";
//     ATTENDANCE_CONFIG.forEach((opcion, index) => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="radio" name="attendance_radio" value="${opcion}" ${index === 0 ? 'checked' : ''}> ${opcion}
//             </label>
//         `;
//     });
//     attendanceRadioGroup.innerHTML = html;
// }

// function generarCheckboxesExperiencias() {
//     if (!experiencesCheckboxGroup) return;
//     let html = "";
//     EXPERIENCES_CONFIG.forEach(exp => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="checkbox" name="experiences_cb" value="${exp}"> ${exp}
//             </label>
//         `;
//     });
//     experiencesCheckboxGroup.innerHTML = html;
// }

// function generarCheckboxesGeneros() {
//     if (!genresCheckboxGroup) return;
//     let html = "";
    
//     GENRES_CONFIG.forEach(genero => {
//         html += `
//             <label class="checkbox-item">
//                 <input type="checkbox" name="genres_cb" value="${genero}"> ${genero}
//             </label>
//         `;
//     });
    
//     html += `
//         <div class="other-option-wrap" style="margin-top: 8px;">
//             <label class="checkbox-item">
//                 <input type="checkbox" value="__other_option__" id="otherCheckbox"> Otro:
//             </label>
//             <input type="text" id="otherText" placeholder="Especifica tu género" style="display: none; margin-top: 6px; width: 100%;">
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

// /* =========================
//    Formatos Automáticos e Inicialización
// ========================= */
// document.addEventListener("DOMContentLoaded", () => {
//     if (window.history.replaceState) {
//         window.history.replaceState(null, null, window.location.href);
//     }

//     // Renderizar componentes
//     generarRadioPuntualidad();
//     generarRadioAsistencia();
//     generarCheckboxesExperiencias();
//     generarCheckboxesGeneros();

//     // Formateador de Instagram
//     if (instagramInput) {
//         instagramInput.addEventListener("input", function() {
//             if (this.value.length > 0 && !this.value.startsWith("@")) this.value = "@" + this.value;
//         });
//         instagramInput.addEventListener("blur", function() {
//             if (this.value === "@") this.value = "";
//         });
//     }

//     // Formateador de WhatsApp
//     if (whatsappCcInput) whatsappCcInput.addEventListener("input", function() { this.value = this.value.replace(/\D/g, ""); });
//     if (whatsappLocalInput) {
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
//    Validación y Envío (Pipeline con Aplanado Dinámico)
// ========================= */
// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     if (!registrosAbiertos) return;

//     const nameVal = document.getElementById("name").value.trim();
//     const emailVal = document.getElementById("email").value.trim();
//     const instagramVal = instagramInput.value.trim();

//     // 1. Validar requeridos simples
//     if (!nameVal || !emailVal) {
//         showErrorModal("Campos incompletos", "Por favor, ingresa tu Nombre y tu Correo electrónico.");
//         return;
//     }

//     // 2. Validar formato de Email
//     const emailInput = document.getElementById("email");
//     if (!emailInput.checkValidity()) {
//         showErrorModal("Correo inválido", "Por favor ingresa un correo válido, ejemplo: hola@gmail.com.");
//         return;
//     }

//     // 3. Validar Radios Requeridos
//     const selectedPunctuality = document.querySelector('input[name="punctuality_radio"]:checked');
//     const selectedAttendance = document.querySelector('input[name="attendance_radio"]:checked');
//     if (!selectedPunctuality || !selectedAttendance) {
//         showErrorModal("Campos requeridos", "Por favor responde las preguntas sobre puntualidad y certeza de asistencia.");
//         return;
//     }

//     // 4. Validar Experiencias Requeridas (Mínimo una)
//     const checkedExperiences = document.querySelectorAll('input[name="experiences_cb"]:checked');
//     if (checkedExperiences.length === 0) {
//         showErrorModal("Selecciona una opción", "Por favor, elige al menos una experiencia que sea de tu interés.");
//         return;
//     }

//     // 5. Validar campo Opcional de Géneros y su input de texto "Otro"
//     const checkedGenres = document.querySelectorAll('input[name="genres_cb"]:checked');
//     if (otherCheckbox && otherCheckbox.checked && !otherText.value.trim()) {
//         showErrorModal("Especifica tu género", "Por favor, escribe tu género musical preferido en el cuadro de texto.");
//         return;
//     }

//     // 6. Validar estructura de Instagram (Si se llega a llenar)
//     if (instagramVal && !/^@[a-zA-Z0-9._]{1,30}$/.test(instagramVal)) {
//         showErrorModal("Usuario de Instagram inválido", "Ingresa un usuario válido (Ej: @tu_usuario) o deja el campo vacío.");
//         return;
//     }

//     // --- CONSTRUCCIÓN DEL DATA PACKET ---
//     const formData = new URLSearchParams();
//     formData.append(fields.name, nameVal);
//     formData.append(fields.email, emailVal);
//     formData.append(fields.instagram, instagramVal);
//     formData.append(fields.punctuality, selectedPunctuality.value);
//     formData.append(fields.attendance, selectedAttendance.value);

//     // Formatear y añadir WhatsApp
//     const ccPuro = whatsappCcInput.value.replace(/\D/g, "");
//     const localPuro = whatsappLocalInput.value.replace(/\D/g, "");
//     if (localPuro.length > 0) {
//         formData.append(fields.whatsapp, (ccPuro.length > 0 ? ccPuro : "52") + localPuro);
//     } else {
//         formData.append(fields.whatsapp, "");
//     }

//     // Aplanar Experiencias por comas
//     const listaExperiencias = [];
//     checkedExperiences.forEach(cb => listaExperiencias.push(cb.value));
//     formData.append(fields.experiences, listaExperiencias.join(", "));

//     // Aplanar Géneros por comas (incluyendo lógica custom para "Otro")
//     const listaGeneros = [];
//     checkedGenres.forEach(cb => listaGeneros.push(cb.value));
//     if (otherCheckbox && otherCheckbox.checked) {
//         const valorOtro = otherText.value.trim();
//         if (valorOtro) listaGeneros.push(valorOtro);
//     }
//     formData.append(fields.genres, listaGeneros.join(", "));

//     // --- ENVÍO POST ---
//     try {
//         await fetch(form.action, {
//             method: "POST",
//             mode: "no-cors",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString()
//         });

//         // Mutar la vista de pantallas
//         registerScreen.style.display = "none";
//         successScreen.style.display = "block";
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         form.reset();
//     } catch (error) {
//         console.error("Error:", error);
//         showErrorModal("Error de conexión", "Hubo un problema de red. Inténtalo de nuevo.");
//     }
// });