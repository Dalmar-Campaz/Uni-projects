package MatrizPractice;

public class Cuaderno {
    private String marca;
    private double precio;
    private String modelo;

    public Cuaderno(String marca, double precio, String modelo) {
        this.marca = marca;
        this.precio = precio;
        this.modelo = modelo;
    }
    public void setMarca(String marca) {
        this.marca = marca;
    }
    public void setPrecio(double precio) {
        this.precio = precio;
    }
    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
    public String getMarca() {
        return marca;
    }
    public double getPrecio() {
        return precio;
    }
    public String getModelo() {
        return modelo;
    }
}
