public class Producto {
    private int cantidadStock;
    private int id;
    private String nombre;
    private double precio;

    public Producto(int id, String nombre, double precio, int cantidadStock) {
        this.nombre = nombre;
        this.precio = precio;
        this.cantidadStock = cantidadStock;
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public int getCantidadStock() {
        return cantidadStock;
    }

    public int getId() {
        return id;
    }

    public void setCantidadStock(int cantidadStock) {
        this.cantidadStock = cantidadStock;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }  

    public void setId(int id) {
        this.id = id;
    }  
    @Override
    public String toString() {
        return "Producto[" + "cantidadStock=" + cantidadStock + ", id=" + id + ", nombre=" + nombre + ", precio=" + precio + "]";
    } 
}