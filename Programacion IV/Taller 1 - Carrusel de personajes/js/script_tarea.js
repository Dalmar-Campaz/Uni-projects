// =========================================================
// EJERCICIO: Galería de personajes con visor tipo carrusel
// =========================================================
// Las referencias al DOM ya están armadas. Tu trabajo es
// completar la lógica en cada sección marcada con TODO.
// =========================================================

// --- Referencias al DOM ---

const contenedorGaleria = document.getElementById("galeria");
const visorImagen = document.getElementById("visor-imagen");
const visorNombre = document.getElementById("visor-nombre");
const visorFranquicia = document.getElementById("visor-franquicia");
const visorCategoria = document.getElementById("visor-categoria");
const visorDescripcion = document.getElementById("visor-descripcion");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const visor = document.getElementById("visor-contenido");

// =========================================================
// la clase definida en la hoja de estilos es tarjeta-personaje
// para la galeria de imagenes
// =========================================================

// --- Pintar la galería de tarjetas ---
console.log("este es el JSON que deben recorrer y pintar");
console.log(personajes);

personajes.forEach((personaje, index) => {
  const tarjeta = document.createElement("div");
  const img = document.createElement("img");
  const nombre = document.createElement("p");

  tarjeta.classList.add("tarjeta-personaje");
  img.src = personaje.imagen;
  nombre.textContent = personaje.nombre;

  tarjeta.addEventListener("click", () => {
    visor.classList.add("cambiando");
    n = index;
    marcarTarjetaActiva();
    setTimeout(() => {
      actualizarVisor();
    }, 200);
  });

  tarjeta.appendChild(img);
  tarjeta.appendChild(nombre);
  contenedorGaleria.appendChild(tarjeta);
});

let n = 0;
btnAnterior.addEventListener("click", () => {
  visor.classList.add("cambiando");
  anterior();
  setTimeout(() => {
    actualizarVisor();
  }, 200);
});

btnSiguiente.addEventListener("click", () => {
  visor.classList.add("cambiando");
  siguiente();
  setTimeout(() => {
    actualizarVisor();
  }, 200);
});

// --- propuesta de funciones que se pueden utilizar ---
function actualizarVisor() {
  visorImagen.src = personajes[n].imagen;
  visorNombre.textContent = personajes[n].nombre;
  visorFranquicia.textContent = personajes[n].franquicia;
  visorCategoria.textContent = personajes[n].categoria;
  visorDescripcion.textContent = personajes[n].descripcion;

  marcarTarjetaActiva();
  visor.classList.remove("cambiando");
}

// --- Resaltar visualmente cuál tarjeta está seleccionada ---
function marcarTarjetaActiva() {
  const tarjetas = document.querySelectorAll(".tarjeta-personaje");

  tarjetas.forEach((tarjeta, index) => {
    if (index === n) {
      tarjeta.classList.add("activa");
    } else {
      tarjeta.classList.remove("activa");
    }
  });
}

// --- Navegación: siguiente ---
function siguiente() {
  if (n === personajes.length - 1) {
    n = 0;
  } else {
    n++;
  }
}

// --- Navegación: anterior ---
function anterior() {
  if (n === 0) {
    n = personajes.length - 1;
  } else {
    n--;
  }
}
actualizarVisor();
