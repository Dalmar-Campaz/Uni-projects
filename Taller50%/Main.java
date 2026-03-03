public class Main {

    public static void main(String[] args) {

    Inventario inventario = new Inventario(5);

    Producto p1 = new Producto(1, "Laptop", 2500.0, 10);
    Producto p2 = new Producto(2, "Mouse", 50.0, 3);
    Producto p3 = new Producto(3, "Teclado", 120.0, 2);
    Producto p4 = new Producto(4, "Monitor", 800.0, 8);

    inventario.agregarProducto(p1);
    inventario.agregarProducto(p2);
    inventario.agregarProducto(p3);
    inventario.agregarProducto(p4);

    Producto buscado = inventario.buscarProductoPorId(2);
    if (buscado != null) {
            System.out.println("Producto encontrado:");
            System.out.println(buscado);
        } else {
            System.out.println("Producto no encontrado.");
    }

    inventario.actualizarStock(2, 20);
    System.out.println("\nStock actualizado:");
    System.out.println(inventario.buscarProductoPorId(2));

    double total = inventario.generarInformeValorTotal();
        System.out.println("\nValor total del inventario: $" + total);

    Producto[] agotados = inventario.obtenerProductosAgotados();

    System.out.println("\nProductos con stock menor a 5:");
        for (Producto p : agotados) {
            System.out.println(p);
        }
    }
}