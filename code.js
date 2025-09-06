'use strict'

// --- Variables de scope global ---
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

// --- Funciones principales ---
function cargarTareas() {
  tareas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function guardarTareas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// --- Render inicial: solo cuando carga el doc ---
function renderTareas() {
  lista.innerHTML = "";

  const tareasOrdenadas = [...tareas].sort((a, b) => a.id - b.id);

  tareasOrdenadas.forEach(tarea => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = tarea.id;

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = tarea.texto;
    if (tarea.done) {
      span.style.textDecoration = "line-through";
    }

    li.appendChild(span);

    if (tarea.done) {
      const status = document.createElement("span");
      status.className = "task-status";
      status.textContent = " REALIZADA! 👍🏻";
      span.insertAdjacentElement("afterend", status);
    }

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "task-buttons";
    buttonsDiv.innerHTML = BOTONES_TAREA;
    li.appendChild(buttonsDiv);

    lista.appendChild(li);
  });
}

// --- Funciones para agregar tarea ---
function crearTarea(texto) {
  const noRealizadas = tareas.filter(t => !t.done);
  const maxId = noRealizadas.length > 0 ? Math.max(...noRealizadas.map(t => t.id)) : 0;
  return { id: maxId + 1, texto, done: false };
}

function agregarTarea(texto) {
  const nuevaTarea = crearTarea(texto);
  tareas.push(nuevaTarea);
  guardarTareas();

  renderTarea(nuevaTarea);
}

function renderTarea(tarea) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = tarea.id;

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = tarea.texto;
  li.appendChild(span);

  if (tarea.done) {
    span.style.textDecoration = "line-through";
    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = " REALIZADA! 👍🏻";
    span.insertAdjacentElement("afterend", status);
  }

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "task-buttons";
  buttonsDiv.innerHTML = BOTONES_TAREA;
  li.appendChild(buttonsDiv);

  const liSiguiente = Array.from(lista.children).find(
    child => Number(child.dataset.id) > tarea.id
  );
  if (liSiguiente) {
    lista.insertBefore(li, liSiguiente);
  } else {
    lista.appendChild(li);
  }
}

// --- Event handlers ---
function manejarSubmit(e) {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;
  agregarTarea(texto);
  input.value = "";
}

// --- Función para eliminar ---
function eliminarTarea(id, li) {
  tareas = tareas.filter(tarea => tarea.id !== id);
  guardarTareas();
  li.remove();
}

// --- Función para toggle done ---
function toggleTareaHecha(id, li) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;

  tarea.done = !tarea.done;
  tarea.id = tarea.done ? tarea.id + DONE_OFFSET : tarea.id - DONE_OFFSET;
  guardarTareas();

  const span = li.querySelector(".task-text");
  span.style.textDecoration = tarea.done ? "line-through" : "";

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
  const liSiguiente = Array.from(lista.children).find(
    child => Number(child.dataset.id) > tarea.id
  );
  if (liSiguiente) {
    lista.insertBefore(li, liSiguiente);
  } else {
    lista.appendChild(li);
  }

  li.dataset.id = tarea.id;
}

// --- Delegar los event listener ---
lista.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    eliminarTarea(id, li);
  }

  if (e.target.classList.contains("done-btn")) {
    toggleTareaHecha(id, li);
  }

  if (e.target.classList.contains("edit-btn")) {
    const span = li.querySelector(".task-text");
    const originalText = span.textContent;
    span.contentEditable = "true";
    span.focus();

    const buttonsDiv = li.querySelector(".task-buttons");
    buttonsDiv.innerHTML = BOTONES_EDIT;

    buttonsDiv.querySelector(".save-btn").addEventListener("click", () => {
      const nuevoTexto = span.textContent.trim();
      if (nuevoTexto) {
      const tarea = tareas.find(t => t.id === id);
      if (tarea) {
        tarea.texto = nuevoTexto;
        guardarTareas();
      }
    }
    else {
      span.textContent = originalText;
    }
      span.contentEditable = "false";
      buttonsDiv.innerHTML = BOTONES_TAREA;
    });

    // Cancelar
    buttonsDiv.querySelector(".cancel-btn").addEventListener("click", () => {
      span.textContent = originalText;
      span.contentEditable = "false";
      buttonsDiv.innerHTML = BOTONES_TAREA;
    });
  }
});