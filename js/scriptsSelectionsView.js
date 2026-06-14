const form = document.getElementById("selectionForm");
const dynamicFields = document.getElementById("selectionFields");
const typeArr = ["Underground","Underground","Underground","Underground","Tendecia de Consumo"]

/* CREAR CAMPOS DINÁMICOS */

function createField(i, labelText, placeholder = "Tu respuesta") {

    const card = document.createElement("div");
    card.className = "form-card";

    card.innerHTML = `
        <label class="label">
            ${labelText}
            <span class="required">*</span>
        </label>

        <input
            type="text"
            id="selection_${i}"
            name="selection_${i}"
            placeholder="${placeholder}"
            required
        >
    `;

    selectionFields.appendChild(card);
}

/* GOOGLE FORMS CONFIG */

const GOOGLE_FORM_ACTION =
"https://docs.google.com/forms/d/e/1FAIpQLSegJZkVa9alBXJ66Ey8RsLl2iE8UZCweoVhiPnEx8HbsbkapA/formResponse";


const fields = {
    name: "entry.767501226",
    selection_1: "entry.789069526",
    selection_2: "entry.1010090530",
    selection_3: "entry.1112729241",
    selection_4: "entry.2082261313",
    selection_5: "entry.1118059162"

};

/* SUBMIT */

const fechaSoloEspectador = new Date("2026-06-06T00:00:00");
const registrosAbiertos = new Date() >= fechaSoloEspectador;
console.log("Get Date Today: ", new Date(),"Flag: ", registrosAbiertos)

if (registrosAbiertos) {
    registerSelectionScreen.style.display = "none";
    successScreenselection.style.display = "none";
    limitScreen.style.display = "block";
}

form.addEventListener("submit", async (e) => {


    e.preventDefault();

    const formData = new FormData();

        formData.append(
        fields.name,
        document.getElementById("name").value
    );

    // ENVIAR TRACKS
    for (let i = 1; i <= 5; i++) {

        const value = document.getElementById(`selection_${i}`).value;

        formData.append(
            fields[`selection_${i}`],
            value
        );
    }

    try {

        await fetch(GOOGLE_FORM_ACTION, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        /* SUCCESS SCREEN */

        document.getElementById("registerSelectionScreen").style.display = "none";

        document.getElementById("successScreenselection").style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        alert("Error al enviar");

    }

});

/* CREAR 5 CAMPOS */

for (let i = 0; i < 5; i++) {

    createField(
        i + 1,
        `Track ${i + 1} (${typeArr[i]})`
    );

}