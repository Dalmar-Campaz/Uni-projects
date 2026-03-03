public class Inventario {
    private Producto[] productos;
    private int cantidadProductos;

    public Inventario(int cantidad) {
        productos = new Producto[cantidad];
        cantidadProductos = 0;
    }

    public void agregarProducto(Producto p) {
        if (cantidadProductos < productos.length) {
            productos[cantidadProductos] = p;
            cantidadProductos++;
        } else {
            System.out.println("Inventario lleno, no se pueden agregar más productos.");
        }
    }

    public Producto buscarProductoPorId(int id) {
        for (int i = 0; i < cantidadProductos; i++) {
            if (productos[i].getId() == id) {
                return productos[i];
            }
        }
        return null;
    }

    public void actualizarStock(int id, int nuevaCantidad) {
        Producto producto = buscarProductoPorId(id);
        if (producto != null) {
            producto.setCantidadStock(nuevaCantidad);
        } else {
            System.out.println("Producto con ID " + id + " no encontrado.");
        }
    }

    public double generarInformeValorTotal() {
        double valorTotal = 0;
        for (int i = 0; i < cantidadProductos; i++) {
            valorTotal += productos[i].getPrecio() * productos[i].getCantidadStock();
        }
        System.out.println("Valor total del inventario: " + valorTotal);
        return valorTotal;
    }
    public Producto[] obtenerProductosAgotados(){
        int contador = 0;
        for (int i = 0; i < cantidadProductos; i++) {
            if (productos[i].getCantidadStock() < 5) {
                contador++;
            }
        }
        Producto[] agotados = new Producto[contador];
        int index = 0;
        for (int i = 0; i < cantidadProductos; i++) {
            if (productos[i].getCantidadStock() < 5) {
                agotados[index] = productos[i];
                index++;
            }
        }
        return agotados;
    }
}
