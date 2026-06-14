
/* =========================
    Google Form Config
========================= */
const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeSBO8Z2Z73xObEO4YjRkMrFKuzYp_MCqI0DdJXUbJOuONewQ/formResponse";

const fields = {
    name: "entry.1153782677",
    contact: "entry.1373560345",
    role: "entry.2088078867"
};

/* =========================
   Date Config
========================= */
const fechaSoloEspectador = new Date("2026-06-04T00:00:00");
const soloEspectador = new Date() >= fechaSoloEspectador;
console.log("Get Date Today: ", new Date())
/* =========================
   Form Status
========================= */
//Como Google bloquea la verificación por Fetch, manejamos este estado manualmente en tu código si lo necesitas.
let registrosAbiertos = true; 

/* =========================
   Views
========================= */
const registerScreen = document.getElementById("registerScreen");
const successScreen = document.getElementById("successScreen");
const limitScreen = document.getElementById("limitScreen");

/* =========================
    Hidden Options
========================= */
document.addEventListener("DOMContentLoaded", () => {

    if (soloEspectador) {

        const radioGroup = document.getElementById("roleRadioGroup");//document.querySelector(".radio-group");

        if (radioGroup) {
            radioGroup.style.display = "none";
        }

        document.querySelector(
            'input[name="role"][value="Espectador"]'
        ).checked = true;

    }

});

/* =========================
   Submit
========================= */
const form = document.getElementById("customForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

  
    if (!registrosAbiertos) {
        registerScreen.style.display = "none";
        successScreen.style.display = "none";
        limitScreen.style.display = "block";
        return;
    }

    // Usamos URLSearchParams en lugar de FormData, ya que a veces Google Forms 
    // procesa mejor los datos simulando un formulario clásico (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    const selectedRole = document.querySelector('input[name="role"]:checked');

    // if (soloEspectador) {

    //     document.querySelector(
    //         'input[name="role"][value="Espectador"]'
    //     ).checked = true;

    //     //document.getElementById("roleRadioGroup").style.display = "none";

    // }

    formData.append(fields.name, document.getElementById("name").value);
    formData.append(fields.contact, document.getElementById("contact").value);
    formData.append(fields.role, selectedRole ? selectedRole.value : "");

    try {
        // El modo 'no-cors' es obligatorio para enviar a Google Forms. 
        // Nota: la respuesta siempre vendrá "vacía" u opaca, pero los datos sí llegan a Google.
        await fetch(GOOGLE_FORM_ACTION, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        /* CAMBIO DE PANTALLA EXITOSO */
        registerScreen.style.display = "none";
        limitScreen.style.display = "none";
        successScreen.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {
        console.error("Error al enviar:", error);
        alert("Hubo un problema al enviar el formulario.");
    }
});



/* =========================
   PANTALLAS
========================= */
// const registerScreen = document.getElementById("registerScreen");
// const successScreen = document.getElementById("successScreen");
// const limitScreen = document.getElementById("limitScreen");

/* =========================
   OCULTAR ROLES SI APLICA
========================= */
// document.addEventListener("DOMContentLoaded", () => {

//     if (soloEspectador) {

//         const radioGroup = document.getElementById("roleRadioGroup");//document.querySelector(".radio-group");

//         if (radioGroup) {
//             radioGroup.style.display = "none";
//         }

//     }

// });

/* =========================
   SUBMIT / ENVÍO
========================= */
// const form = document.getElementById("customForm");

// form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     /* VERIFICAR SI ESTÁ CERRADO */
//     if (!registrosAbiertos) {
//         registerScreen.style.display = "none";
//         successScreen.style.display = "none";
//         limitScreen.style.display = "block";
//         return;
//     }

//     const formData = new URLSearchParams();

 
//     const selectedRole = document.querySelector('input[name="role"]:checked');
//     role = selectedRole ? selectedRole.value : "";

//     if (soloEspectador) {

//         document.querySelector(
//             'input[name="role"][value="Espectador"]'
//         ).checked = true;

//         document.getElementById("roleRadioGroup").style.display = "none";

//     }
    

//     formData.append(fields.name, document.getElementById("name").value);
//     formData.append(fields.contact, document.getElementById("contact").value);
//     formData.append(fields.role, role);

//     try {

//         await fetch(GOOGLE_FORM_ACTION, {
//             method: "POST",
//             mode: "no-cors",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded"
//             },
//             body: formData.toString()
//         });

//         /* CAMBIO DE PANTALLA EXITOSO */
//         registerScreen.style.display = "none";
//         limitScreen.style.display = "none";
//         successScreen.style.display = "block";

//         window.scrollTo({
//             top: 0,
//             behavior: "smooth"
//         });

//     } catch (error) {

//         console.error("Error al enviar:", error);

//         alert("Hubo un problema al enviar el formulario.");

//     }

// });