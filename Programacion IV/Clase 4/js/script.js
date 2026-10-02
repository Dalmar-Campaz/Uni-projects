console.log(productos[0].nombre);

const contenedorProductos = document.getElementById("productos");
const contenedorCarrito = document.getElementById("carrito");
const totalCarrito = document.getElementById("totalCarrito");

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
    if(producto.stock === 0){
        boton.textContent = "sin stock"
        boton.disabled = true;
    }else {
        boton.textContent = "Agregar al carrito"
    }
    boton.addEventListener("click", ()=>{
        console.log("Im clicking");
    })

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(precio);
    tarjeta.appendChild(boton);

    contenedorProductos.appendChild(tarjeta);
})

function agregarAlCarrito(id) {
  const producto = productos.find((producto) => producto.id === id);
  if (producto) {
    carrito.push(producto);
    actualizarCarrito();
  }
}

function actualizarCarrito() {
    
}