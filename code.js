
// --- Variables de scope global ---
const
  STORAGE_KEY = "tareas",
  lista = document.getElementById("task-list"),
  form = document.querySelector(".task-form"),
  input = document.querySelector(".task-input")

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

function renderTareas() {
  const lista = document.getElementById("task-list");
  lista.innerHTML = "";

  tareas.forEach(tarea => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = tarea.id;

    li.innerHTML = `
      <span class="task-text" style="${tarea.done ? 'text-decoration: line-through;' : ''}">
        ${tarea.texto}
      </span>
      <div class="task-buttons">
        <button class="done-btn">✅</button>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    lista.appendChild(li);
  });
}

function crearTarea(texto) {
  const maxId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) : 0;
  return {
    id: maxId + 1,
    texto,
    done: false
  };
}

function agregarTarea(texto) {
  const nuevaTarea = crearTarea(texto);
  tareas.push(nuevaTarea);
  guardarTareas();
  renderTareas();
}

// --- Event handlers ---
function manejarSubmit(e) {
  e.preventDefault();
  const texto = input.value.trim();
  if (texto === "") return;
  agregarTarea(texto);
  input.value = "";
}
