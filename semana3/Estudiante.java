package semana3;

public class Estudiante {
    private String nombre;
    private int semestre;
    private String programa;
    private double notaPromedio;
    private int edad;

    public Estudiante(String nombre, int semestre, String programa, double notaPromedio, int edad){
        this.nombre = nombre;
        this.semestre = semestre;
        this.programa = programa;
        this.notaPromedio = notaPromedio;
        this.edad = edad;
    }

    public Estudiante(){
        this.nombre = "";
        this.semestre = 0;
        this.programa = "";
        this.notaPromedio = 1.0;
        this.edad = 0;
    }
    public double calcularEdadPromedio(int [] e ){
        int suma = 0;
        for(int i = 0; i < e.length; i++){
            suma += e[i];
        }
        return suma / e.length;
    }
    public String getNombre() {
        return nombre;
    }

    public int getSemestre() {
        return semestre;
    }

    public String getPrograma() {
        return programa;
    }

    public double getNotaPromedio() {
        return notaPromedio;
    }

    public int getEdad() {
        return edad;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setSemestre(int semestre) {
        this.semestre = semestre;
    }

    public void setNotaPromedio(double notaPromedio) {
        this.notaPromedio = notaPromedio;
    }

    public void setPrograma(String programa) {
        this.programa = programa;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }

    
}
