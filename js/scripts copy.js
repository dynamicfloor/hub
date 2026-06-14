// /* GOOGLE FORMS CONFIG */

// const GOOGLE_FORM_ACTION =
// "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeSBO8Z2Z73xObEO4YjRkMrFKuzYp_MCqI0DdJXUbJOuONewQ/formResponse";

// const fields = {

//     name: "entry.1153782677",
//     contact: "entry.1373560345",
//     role: "entry.2088078867"

// };

// /*  SUBMIT */

// const form = document.getElementById("customForm");

// form.addEventListener("submit", async (e)=>{

//     e.preventDefault();

//     const formData = new FormData();

//     const selectedRole =
//         document.querySelector('input[name="role"]:checked');

//     formData.append(
//         fields.name,
//         document.getElementById("name").value
//     );

//     formData.append(
//         fields.contact,
//         document.getElementById("contact").value
//     );

//     formData.append(
//         fields.role,
//         selectedRole ? selectedRole.value : ""
//     );

//     try{

//         await fetch(GOOGLE_FORM_ACTION,{
//             method:"POST",
//             mode:"no-cors",
//             body:formData
//         });

//         /* SUCCESS SCREEN */

//         document.getElementById("registerScreen").style.display = "none";

//         document.getElementById("successScreen").style.display = "block";

//         window.scrollTo({
//             top:0,
//             behavior:"smooth"
//         });

//     }catch(error){

//         alert("Error al enviar");

//     }

// });

/* GOOGLE FORMS CONFIG */

/* GOOGLE FORMS CONFIG */

const GOOGLE_FORM_ACTION =
"https://docs.google.com/forms/u/0/d/e/1FAIpQLSeSBO8Z2Z73xObEO4YjRkMrFKuzYp_MCqI0DdJXUbJOuONewQ/formResponse";

const GOOGLE_FORM_VIEW =
"https://docs.google.com/forms/d/e/1FAIpQLSeSBO8Z2Z73xObEO4YjRkMrFKuzYp_MCqI0DdJXUbJOuONewQ/viewform";

const fields = {

    name: "entry.1153782677",
    contact: "entry.1373560345",
    role: "entry.2088078867"

};

/* FORM */

const form = document.getElementById("customForm");

/* CHECK IF FORM IS CLOSED */

async function isFormClosed(){

    try{

        const response = await fetch(GOOGLE_FORM_VIEW);

        const html = await response.text();

        return (
            html.includes("Ya no se aceptan respuestas") ||
            html.includes("This form is no longer accepting responses")
        );

    }catch(error){

        console.error(error);

        return false;

    }

}

/* PRELOAD VALIDATION */

window.addEventListener("load", async ()=>{

    const closed = await isFormClosed();

    if(closed){

        document.getElementById("registerScreen").style.display = "none";

        document.getElementById("limitScreen").style.display = "block";

    }

});

/* SUBMIT */

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    /* VALIDATE AGAIN BEFORE SEND */

    const closed = await isFormClosed();

    if(closed){

        document.getElementById("registerScreen").style.display = "none";

        document.getElementById("limitScreen").style.display = "block";

        return;

    }

    const formData = new FormData();

    const selectedRole =
        document.querySelector('input[name="role"]:checked');

    /* VALUES */

    formData.append(
        fields.name,
        document.getElementById("name").value
    );

    formData.append(
        fields.contact,
        document.getElementById("contact").value
    );

    formData.append(
        fields.role,
        selectedRole ? selectedRole.value : ""
    );

    try{

        /* SEND */

        await fetch(GOOGLE_FORM_ACTION,{
            method:"POST",
            mode:"no-cors",
            body:formData
        });

        /* SUCCESS */

        document.getElementById("registerScreen").style.display = "none";

        document.getElementById("successScreen").style.display = "block";

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }catch(error){

        console.error(error);

        alert(
            "Ocurrió un error al enviar el registro."
        );

    }

});