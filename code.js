'use strict'

// --- Variables globales ---
const
  STORAGE_KEY = "tareas",
  DONE_OFFSET = 1000,
  lista = document.querySelector(".task-list"),
  form = document.querySelector(".task-form"),
  input = document.querySelector(".task-input"),
  BOTONES_TAREA = `
    <button class="done-btn">✅</button>
    <button class="edit-btn">✏️</button>
    <button class="delete-btn">🗑️</button>
  `,
  BOTONES_EDIT = `
    <button class="save-btn">✔️</button>
    <button class="cancel-btn">❌</button>
  `;

let tareas = [];

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  renderTareas();
  form.addEventListener("submit", manejarSubmit);
});

// --- Storage ---
function cargarTareas() {
  tareas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function guardarTareas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// --- Render (solo full al iniciar) ---
function renderTareas() {
  lista.innerHTML = "";
  const tareasOrdenadas = [...tareas].sort((a, b) => a.id - b.id);
  tareasOrdenadas.forEach(tarea => renderTarea(tarea));
}

function renderTarea(tarea) {
  const li = document.createElement("li");
  li.className = "task-item";
  if (tarea.done) li.classList.add("done");
  li.dataset.id = tarea.id;

  // contenido
  const contentDiv = document.createElement("div");
  contentDiv.className = "task-content";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = tarea.texto;
  if (tarea.done) span.classList.add("done");
  contentDiv.appendChild(span);

  if (tarea.done) {
    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = " REALIZADA! 👍🏻";
    contentDiv.appendChild(status);
  }

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "task-buttons";
  buttonsDiv.innerHTML = BOTONES_TAREA;
  contentDiv.appendChild(buttonsDiv);

  li.appendChild(contentDiv);

  // fecha (franja inferior)
  if (tarea.fecha) {
    const fechaEl = document.createElement("div");
    fechaEl.className = "task-date";
    fechaEl.textContent = tarea.fecha;
    li.appendChild(fechaEl);
  }

  // insertar en orden
  const liSiguiente = Array.from(lista.children).find(
    child => Number(child.dataset.id) > tarea.id
  );
  if (liSiguiente) lista.insertBefore(li, liSiguiente);
  else lista.appendChild(li);
}

// --- Crear / Agregar tarea ---
function crearTarea(texto) {
  const noRealizadas = tareas.filter(t => !t.done);
  const maxId = noRealizadas.length > 0 ? Math.max(...noRealizadas.map(t => t.id)) : 0;

  const ahora = new Date();
  const fechaFormateada = ahora.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) + " - " + ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return { id: maxId + 1, texto, done: false, fecha: fechaFormateada };
}

function agregarTarea(texto) {
  const nuevaTarea = crearTarea(texto);
  tareas.push(nuevaTarea);
  guardarTareas();
  renderTarea(nuevaTarea);
}

// --- Handlers ---
function manejarSubmit(e) {
  e.preventDefault();

  // Dispara la validación nativa del navegador
  if (!input.checkValidity()) {
    input.reportValidity(); // muestra el mensaje nativo
    return;
  }

  agregarTarea(input.value.trim());
  input.value = "";
}


// --- Eliminar ---
function eliminarTarea(id, li) {
  tareas = tareas.filter(t => t.id !== id);
  guardarTareas();
  if (li && li.parentNode) li.remove();
}

// --- Toggle hecha ---
function toggleTareaHecha(id, li) {
  const idx = tareas.findIndex(t => t.id === id);
  if (idx === -1) return;
  const tarea = tareas[idx];

  // toggle y ajustar id
  tarea.done = !tarea.done;
  tarea.id = tarea.done ? tarea.id + DONE_OFFSET : tarea.id - DONE_OFFSET;
  guardarTareas();

  // actualizar visual y dataset en el li existente
  li.dataset.id = tarea.id;
  li.classList.toggle("done", tarea.done);

  const span = li.querySelector(".task-text");
  span.classList.toggle("done", tarea.done);

  let status = li.querySelector(".task-status");
  if (tarea.done && !status) {
    status = document.createElement("span");
    status.className = "task-status";
    status.textContent = " REALIZADA! 👍🏻";
    span.insertAdjacentElement("afterend", status);
  } else if (!tarea.done && status) {
    status.remove();
  }

  li.remove();
  const tareasOrdenadas = [...tareas].sort((a, b) => a.id - b.id);
  const next = tareasOrdenadas.find(t => t.id > tarea.id);
  if (next) {
    const refLi = lista.querySelector(`li[data-id='${next.id}']`);
    if (refLi) lista.insertBefore(li, refLi);
    else lista.appendChild(li);
  } else {
    lista.appendChild(li);
  }
}

// --- Edición inline ---
function iniciarEdicion(li, id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;

  const span = li.querySelector(".task-text");
  const originalText = span.textContent;

  span.contentEditable = "true";
  span.focus();

  const botonesDiv = li.querySelector(".task-buttons");
  botonesDiv.innerHTML = BOTONES_EDIT;

  const saveBtn = botonesDiv.querySelector(".save-btn");
  const cancelBtn = botonesDiv.querySelector(".cancel-btn");

  saveBtn.onclick = () => {
    const nuevoTexto = span.textContent.trim();
    if (nuevoTexto) {
      tarea.texto = nuevoTexto;
      guardarTareas();
      span.textContent = nuevoTexto;
    } else {
      span.textContent = originalText;
    }
    span.contentEditable = "false";
    botonesDiv.innerHTML = BOTONES_TAREA;
  };

  cancelBtn.onclick = () => {
    span.textContent = originalText;
    span.contentEditable = "false";
    botonesDiv.innerHTML = BOTONES_TAREA;
  };
}

// --- Delegación de eventos ---
lista.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);
  const target = e.target;

  if (target.classList.contains("delete-btn")) {
    eliminarTarea(id, li);
    return;
  }

  if (target.classList.contains("done-btn")) {
    if (li.classList.contains("done")) return;
    toggleTareaHecha(id, li);
    return;
  }

  if (target.classList.contains("edit-btn")) {
    if (li.classList.contains("done")) return;
    iniciarEdicion(li, id);
    return;
  }
});