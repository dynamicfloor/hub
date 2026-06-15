// =====================================
// ESTADO
// =====================================

// let queue =
//     JSON.parse(
//         localStorage.getItem(
//             "dj_queue"
//         )
//     ) || [];

let queue = []

let activeIndex = 0;
let timerInterval = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let modalMode = "create";
let editingId = null;
// Nueva variable de estado para saber si el cronómetro ya inició alguna vez
let isPlayingStarted = false; 

// =====================================
// INIT
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initColorPicker();
        renderQueue();
        startLiveClock();

        document
            .getElementById(
                "edit-form"
            )
            .addEventListener(
                "submit",
                saveParticipant
            );

        if(queue.length){
            loadCurrentParticipant();
        }
    }
);

// =====================================
// LIVE CLOCK
// =====================================

function startLiveClock(){
    updateLiveClock();
    setInterval(
        updateLiveClock,
        1000
    );
}

function updateLiveClock(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,"0");
    const mm = String(now.getMinutes()).padStart(2,"0");
    const ss = String(now.getSeconds()).padStart(2,"0");

    document.getElementById(
        "live-clock"
    ).textContent = `${hh}:${mm}:${ss}`;
}

// =====================================
// COLOR PICKER
// =====================================

function initColorPicker(){
    // const colors = [
    //     "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444",
    //     "#f59e0b", "#ec4899", "#06b6d4", "#64748b"
    // ];

    const colors = [
        "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444",
        "#f59e0b", "#ec4899", "#06b6d4", "#64748b",
        "#1d4ed8", "#7c3aed", "#16a34a", "#dc2626",
        "#f97316", "#14b8a6", "#60a5fa", "#a78bfa",
        "#84cc16", "#e11d48", "#0ea5e9", "#10b981",
        "#facc15", "#6366f1"
    ]

    const container = document.getElementById("color-options");
    container.innerHTML = "";

    colors.forEach(color=>{
        const dot = document.createElement("div");
        dot.className = "color-dot";
        dot.style.background = color;
        dot.dataset.color = color;

        dot.addEventListener(
            "click",
            ()=>{
                document
                    .querySelectorAll(".color-dot")
                    .forEach(d=>d.classList.remove("active"));
                dot.classList.add("active");
            }
        );

        container.appendChild(dot);
    });

    container.querySelector(".color-dot")?.classList.add("active");
}

// =====================================
// MODAL
// =====================================

function openModal(mode = "create", id = null){
    // Bloquear apertura si ya se dio PLAY
    if(isPlayingStarted) return; 

    modalMode = mode;
    editingId = id;

    document.getElementById("edit-form").reset();

    document
        .querySelectorAll(".edit-only")
        .forEach(btn=>{
            btn.style.display = mode === "edit" ? "block" : "none";
        });

    if(mode === "edit"){
        const item = queue.find(x=>x.id===id);
        if(item){
            document.getElementById("participant-name").value = item.nombre;
            document.getElementById("participant-duration").value = item.minutos;
            document.getElementById("participant-notes").value = item.notes || "";
        }
    }

    document.getElementById("modal-title-text").textContent =
        mode === "edit" ? "Editar Participante" : "Agregar Selector o Dj";

    document.getElementById("edit-modal").classList.add("active");
}

function closeModal(){
    document.getElementById("edit-modal").classList.remove("active");
}

// =====================================
// GUARDAR
// =====================================

function saveParticipant(e){
    e.preventDefault();

    const nombre = document.getElementById("participant-name").value.trim();
    const minutos = parseInt(document.getElementById("participant-duration").value);
    const notes = document.getElementById("participant-notes").value;
    const color = document.querySelector(".color-dot.active")?.dataset.color || "#3b82f6";

    if(modalMode === "create"){
        queue.push({
            id: Date.now(),
            nombre,
            minutos,
            color,
            notes
        });
    }else{
        const item = queue.find(x=>x.id===editingId);
        if(item){
            item.nombre = nombre;
            item.minutos = minutos;
            item.color = color;
            item.notes = notes;
        }
    }

    saveQueue();
    renderQueue();

    if(queue.length){
        loadCurrentParticipant();
    }

    closeModal();
}

// =====================================
// RENDER
// =====================================

function renderQueue(){
    const container = document.getElementById("timers-container");
    container.innerHTML = "";

    queue.forEach((item, index)=>{
        const card = document.createElement("div");
        card.className = "timer-card";

        if(index === activeIndex){
            card.classList.add("active");
        }

        // Modificación: El botón "Editar" se renderiza con "display: none" si ya se dio PLAY
        card.innerHTML = `
            <div class="timer-info">
                <div class="timer-title" style="color:${item.color}">
                    ${item.nombre}
                </div>
                <div class="timer-sub">
                    ${item.minutos} min
                </div>
            </div>
            <div class="timer-actions">
                <button
                    class="edit-btn"
                    style="display: ${isPlayingStarted ? 'none' : 'block'};"
                    onclick="openModal('edit', ${item.id})"
                >
                    Editar
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    saveQueue();
}

// =====================================
// CARGAR DJ ACTUAL
// =====================================

function loadCurrentParticipant(){
    const current = queue[activeIndex];
    if(!current) return;

    totalSeconds = current.minutos * 60;
    remainingSeconds = totalSeconds;

    const next = queue[activeIndex + 1];

    document.getElementById("current-segment-title").textContent = current.nombre;
    document.getElementById("current-segment-host").textContent =
        next ? `A continuación: ${next.nombre}` : "Cierre";

    updateClock();
}

// =====================================
// TIMER
// =====================================

function handlePlay(){
    if(timerInterval) return;

    // 1. Cambiamos el estado a verdadero
    isPlayingStarted = true; 

    // 2. Ocultamos el botón de "Agregar Participante" del HTML
    const addBtn = document.getElementById("add-participant-btn");
    if(addBtn) addBtn.style.display = "none";

    // 3. Ocultamos todos los botones "Editar" existentes en la lista
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.style.display = "none";
    });

    timerInterval =
        setInterval(()=>{
            remainingSeconds--;
            updateClock();

            if(remainingSeconds <= 0){
                handleNext();
            }
        },1000);
}

function handleStop(){
    clearInterval(timerInterval);
    timerInterval = null;
}

// function handleNext(){
//     handleStop();

//     if(activeIndex < queue.length - 1){
//         activeIndex++;
//         renderQueue();
//         loadCurrentParticipant();
//         handlePlay();
//     }
// }

// function handleNext(){
//     handleStop();

//     // Si todavía quedan participantes en la cola...
//     if(activeIndex < queue.length - 1){
//         activeIndex++;
//         renderQueue();
//         loadCurrentParticipant();
//         handlePlay();
//     } else {
       
//         document.getElementById("current-segment-title").textContent = "EVENTO FINALIZADO";
//         document.getElementById("current-segment-host").textContent = "¡Gracias!";
//         document.getElementById("main-clock").textContent = "--:--";
//         clock.style.color = "";
//         clock.classList.remove("warning", "danger");

//         // 3. Vaciamos la barra de progreso
//         document.getElementById("progress-bar").style.width = "0%";
        
//         const badge = document.getElementById("status-badge");
//         if(badge) {
//             badge.textContent = "FINALIZÓ";
//             badge.style.color = "#3b82f6"; 
//         }
//     }
// }
function handleNext(){
    handleStop();

    if(activeIndex < queue.length - 1){
        activeIndex++;
        renderQueue();
        loadCurrentParticipant();
        handlePlay();
    } 
    else {
        // 1. Limpiamos los textos de la pantalla
        document.getElementById("current-segment-title").textContent = "EVENTO FINALIZADO";
        document.getElementById("current-segment-host").textContent = "¡Gracias!";
        
        // 2. Quitamos el 00:00 y limpiamos el color ROJO del reloj (removiendo las clases de CSS)
        const clock = document.getElementById("main-clock");
        clock.textContent = "--:--"; // O puedes dejarlo vacío "" si lo prefieres
        clock.style.color = "";      // Limpia el color dinámico de JS
        clock.classList.remove("warning", "danger"); // <-- ¡ADIÓS AL ROJO DE PÁNICO!

        // 3. Vaciamos la barra de progreso
        document.getElementById("progress-bar").style.width = "0%";
        
        // 4. Cambiamos el badge a un color tranquilo de cierre
        const badge = document.getElementById("status-badge");
        if(badge) {
            badge.textContent = "FINALIZÓ";
            badge.style.color = "#3b82f6"; // Azul amigable
        }
    }
}

function updateClock(){
    const clock = document.getElementById("main-clock");
    const progressBar = document.getElementById("progress-bar");
    const badge = document.getElementById("status-badge");

    const elapsed = totalSeconds - remainingSeconds;
    const progress = totalSeconds ? (elapsed / totalSeconds) * 100 : 0;

    const mm = Math.floor(remainingSeconds / 60);
    const ss = remainingSeconds % 60;

    clock.textContent = `${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
    progressBar.style.width = `${progress}%`;

     clock.classList.remove("warning", "danger");

    const esElUltimo = (activeIndex === queue.length - 1);

    if (progress >= 90) {
        // Si es el último dice "FINALIZA EL EVENTO", si no, el "FINALIZA" normal
        badge.textContent = esElUltimo ? "FINALIZA" : "¡ENTREGAR AHORA!"; 
        badge.style.color = "#ef4444"; // Rojo
        clock.style.color = "#ef4444";
        clock.classList.add("danger");
    } else if (progress >= 80) {
        // Si es el último dice "PREPARA EL FINAL", si no, el "WRAP-UP" o texto normal
        badge.textContent = esElUltimo ? "PREPARATE PARA FINALIZAR" : "PREPARAR TRANSICIÓN"; 
        badge.style.color = "#f59e0b"; // Naranja
        clock.style.color = "#f59e0b";
        clock.classList.add("warning");
    } else {
        badge.textContent = "CABINA";
        badge.style.color = "#22c55e"; // Verde
        clock.style.color = "";         // Color por defecto
    }


    // if (progress >= 90) {
    //     badge.textContent = "¡ENTREGA AHORA!";
    //     badge.style.color = "#ef4444"; 
    //     clock.style.color = "#ef4444"; 
    //     clock.classList.add("danger");
    // } 
    // else if (progress >= 80) {
    //     badge.textContent = "PREPARA TRANSICIÓN";
    //     badge.style.color = "#f59e0b"; 
    //     clock.style.color = "#f59e0b"; 
    //     clock.classList.add("warning");
    // } 
    // else {
    //     badge.textContent = "CABINA";
    //     badge.style.color = "#22c55e"; 
    //     clock.style.color = "";         
    // }

    // if(progress >= 90){
    //     badge.textContent = "CAMBIO INMINENTE";
    //     clock.classList.add("danger");
    // }else if(progress >= 80){
    //     badge.textContent = "WRAP-UP";
    //     clock.classList.add("warning");
    // }else{
    //     badge.textContent = "EN TIEMPO";
    // }
}

// =====================================
// FUNCIONALIDAD RESET (NUEVA)
// =====================================

// =====================================
// FUNCIONALIDAD RESET (BORRADO TOTAL)
// =====================================

function handleReset() {
    // 1. Detener el temporizador si está corriendo
    handleStop();

    // 2. Vaciar por completo el arreglo de participantes
    queue = [];

    // 3. Borrar los datos guardados en el almacenamiento del navegador
    localStorage.removeItem("dj_queue"); // O puedes usar saveQueue(); ya que queue está vacío

    // 4. Reiniciar los índices y estados visuales
    activeIndex = 0;
    isPlayingStarted = false;

    // 5. Volver a mostrar el botón "Agregar Participante" por si estaba oculto
    const addBtn = document.getElementById("add-participant-btn");
    if(addBtn) addBtn.style.display = "block";

    // 6. Volver a renderizar la lista (ahora quedará vacía)
    renderQueue();

    // 7. Limpiar por completo el contenedor principal del reloj y textos
    document.getElementById("current-segment-title").textContent = "AGREGAR DJ O SELECTOR";
    document.getElementById("current-segment-host").textContent = "A continuación: EN ESPERA";
    document.getElementById("main-clock").textContent = "00:00";
    document.getElementById("progress-bar").style.width = "0%";
    //document.getElementById("main-clock").style.color = ""; 
    // const badge = document.getElementById("status-badge");
    // if(badge) badge.textContent = "AGREGAR SELECTOR O DJ";
    const clock = document.getElementById("main-clock");
    clock.textContent = "00:00";
    clock.style.color = "";       
    clock.classList.remove("warning", "danger"); 
    
    const badge = document.getElementById("status-badge");
    if (badge) {
        badge.textContent = "EN ESPERA";
        badge.style.color = ""; 
    }
}

// function handleReset() {
//     // 1. Detener cualquier intervalo activo
//     handleStop();

//     // 2. Reiniciar variables de control
//     activeIndex = 0;
//     isPlayingStarted = false;

//     // 3. Volver a mostrar el botón "Agregar Participante"
//     const addBtn = document.getElementById("add-participant-btn");
//     if(addBtn) addBtn.style.display = "block";

//     // 4. Forzar el rediseño de la cola para que reaparezcan los botones de "Editar"
//     renderQueue();

//     // 5. Recargar el primer participante si la lista no está vacía
//     if (queue.length) {
//         loadCurrentParticipant();
//     } else {
//         // Si no hay participantes, limpiar textos del display principal
//         document.getElementById("current-segment-title").textContent = "---";
//         document.getElementById("current-segment-host").textContent = "---";
//         document.getElementById("main-clock").textContent = "00:00";
//         document.getElementById("progress-bar").style.width = "0%";
//         document.getElementById("status-badge").textContent = "SIN DATOS";
//     }
// }

// =====================================
// ELIMINAR
// =====================================

function deleteParticipant(){
    queue = queue.filter(x=>x.id!==editingId);
    saveQueue();
    renderQueue();
    closeModal();
}

// =====================================
// STORAGE
// =====================================

function saveQueue(){
    localStorage.setItem(
        "dj_queue",
        JSON.stringify(queue)
    );
}

// =====================================
// FOCUS MODE
// =====================================

function toggleFocusMode(){
    document.querySelector(".main-display").classList.toggle("focus-mode");
    document.body.classList.toggle("focus-active");
}