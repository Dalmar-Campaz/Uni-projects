console.log(productos[0].nombre);

const contenedorProductos = document.getElementById("productos");
const contenedorCarrito = document.getElementById("items-carrito");
const totalCarrito = document.getElementById("total-carrito");

let carrito = [];

productos.forEach((producto) => {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta-producto");

  const imagen = document.createElement("img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;

  const nombre = document.createElement("h3");
  nombre.textContent = producto.nombre;

  const precio = document.createElement("p");
  precio.textContent = `$${producto.precio.toLocaleString("es-CO")}`;

  const boton = document.createElement("button");
  boton.dataset.id = producto.id;
  if (producto.stock === 0) {
    boton.textContent = "sin stock";
    boton.disabled = true;
  } else {
    boton.textContent = "Agregar al carrito";
  }
  boton.addEventListener("click", () => {
    agregarAlCarrito(producto.id);
  });

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(nombre);
  tarjeta.appendChild(precio);
  tarjeta.appendChild(boton);

  contenedorProductos.appendChild(tarjeta);
});

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  carrito.push(producto);
  actualizarCarrito();
}

function actualizarCarrito() {
  contenedorCarrito.innerHTML = ""; // Limpiar el contenedor del carrito

  carrito.forEach((item) => {
    const fila = document.createElement("div");
    fila.classList.add("item-carrito");

    const nombre = document.createElement("span");
    nombre.textContent = item.nombre;

    const precio = document.createElement("span");
    precio.textContent = `$${item.precio.toLocaleString("es-CO")}`;

    fila.appendChild(nombre);
    fila.appendChild(precio);

    contenedorCarrito.appendChild(fila);
  });

  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  totalCarrito.textContent = total.toLocaleString("es-CO");
}
