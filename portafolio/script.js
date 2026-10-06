"use strict";

/* ---------- Datos: edita aquí tus talleres ---------- */
const GITHUB_CODIGO =
  "https://github.com/Dalmar-Campaz/Uni-projects/tree/main/Programacion IV/Taller ";
const GITHUB_PAGINA =
  "https://dalmar-campaz.github.io/Uni-projects/Programacion IV/Taller ";
const trabajos = [
  {
    n: "01",
    tipo: "taller",
    estado: "completado",
    titulo: "Taller 1 - Carrusel de personajes",
    desc: "Variables, condicionales y ciclos para resolver ejercicios básicos de lógica en el navegador.",
    tech: ["JavaScript"],
    numero: "1",
  },
];

const ETIQUETA = {
  completado: "Completado",
  proceso: "En proceso",
  pendiente: "Pendiente",
};
const ICONO_CODIGO =
  '<svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>';
const ICONO_PAGINA =
  '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>';

/* ---------- Tarjetas ---------- */
const grid = document.getElementById("grid");

  // <div class="thumb thumb--${(1 % 4) + 1}" aria-hidden="true"></div>
function crearTarjeta(t, i) {
  const el = document.createElement("article");
  el.className = "card";
  el.dataset.tipo = t.tipo;
  el.dataset.estado = t.estado;
  el.innerHTML = `
    <div class="card-top">
      <span class="num">${t.n}</span>
      <span class="status status--${t.estado}">${ETIQUETA[t.estado]}</span>
      <img class="thumbnail" src="/portafolio/miniaturas/T${t.numero}-thumbnail.png" alt="Miniatura del taller ${t.numero}" />

    </div>
    <h3>${t.titulo}</h3>
    <p class="muted">${t.desc}</p>
    <ul class="tags">${t.tech.map((x) => `<li>${x}</li>`).join("")}</ul>
    <div class="card-links">
      <a href="${GITHUB_CODIGO}${t.numero}" target="_blank" rel="noopener noreferrer">${ICONO_CODIGO}Ver código</a>
      <a href="${GITHUB_PAGINA}${t.numero}/index.html" target="_blank" rel="noopener noreferrer">${ICONO_PAGINA}Ver página</a>
    </div>`;
  const thumbnail = el.querySelector(".thumbnail");
  thumbnail.addEventListener(
    "error",
    () => {
      const fallback = document.createElement("div");
      fallback.className = `thumb thumb--${(i % 4) + 1}`;
      fallback.setAttribute("aria-hidden", "true");
      thumbnail.replaceWith(fallback);
    },
    { once: true },
  );
  return el;
}
trabajos.forEach((t, i) => grid.appendChild(crearTarjeta(t, i)));

/* ---------- Filtros ---------- */
const chips = document.querySelectorAll(".chip");
const navLinks = document.querySelectorAll(".nav-link");
const vacio = document.getElementById("vacio");

function coincide(card, f) {
  if (f === "todos") return true;
  if (f === "pendiente") return card.dataset.estado === "pendiente";
  return card.dataset.tipo === f;
}

function filtrar(f) {
  let visibles = 0;
  grid.querySelectorAll(".card").forEach((c) => {
    const ok = coincide(c, f);
    c.hidden = !ok;
    if (ok) visibles++;
  });
  vacio.hidden = visibles > 0;
  chips.forEach((b) => {
    const activo = b.dataset.filter === f;
    b.classList.toggle("is-active", activo);
    b.setAttribute("aria-pressed", activo);
  });
  navLinks.forEach((a) =>
    a.classList.toggle("is-active", a.dataset.filter === f),
  );
}

chips.forEach((b) =>
  b.addEventListener("click", () => filtrar(b.dataset.filter)),
);
navLinks.forEach((a) =>
  a.addEventListener("click", () => filtrar(a.dataset.filter)),
);

/* ---------- Contadores (se calculan desde los datos) ---------- */
document.getElementById("n-talleres").textContent = trabajos.filter(
  (t) => t.tipo === "taller",
).length;
document.getElementById("n-proyectos").textContent = trabajos.filter(
  (t) => t.tipo === "proyecto",
).length;
document.getElementById("n-pendientes").textContent = trabajos.filter(
  (t) => t.estado === "pendiente",
).length;

/* ---------- Tema claro / oscuro ---------- */
const root = document.documentElement;
const botonTema = document.getElementById("tema");

function aplicarTema(t) {
  root.dataset.theme = t;
  botonTema.setAttribute(
    "aria-label",
    t === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro",
  );
  try {
    localStorage.setItem("tema", t);
  } catch (e) {
    /* almacenamiento no disponible */
  }
}
aplicarTema(root.dataset.theme);
botonTema.addEventListener("click", () =>
  aplicarTema(root.dataset.theme === "dark" ? "light" : "dark"),
);
