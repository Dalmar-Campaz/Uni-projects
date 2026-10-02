package semana3;

public class ejercicio2 {
    public static void main(String[] args) {
        Estudiante[] est = new Estudiante[17];

        est[0] = new Estudiante("Juan", 2, "Ingenieria en Sistemas", 2.8, 26);
        est[1] = new Estudiante("Pedro", 5, "Ingenieria Mecanica", 4.3, 19);
        est[2] = new Estudiante("Oscar", 3, "Ingenieria Industrial", 3.5, 22);
        est[3] = new Estudiante("Sofia", 3, "Ciencias del Deporte", 4.5, 20);
        est[4] = new Estudiante("Juan", 4, "Ingenieria en Sistemas", 2.8, 26);
        est[5] = new Estudiante("Pedro", 5, "Ingenieria en Sistemas", 4.3, 19);
        est[6] = new Estudiante("Oscar", 6, "Ingenieria en Sistemas", 3.5, 22);
        est[7] = new Estudiante("Sofia", 6, "Ingenieria en Sistemas", 4.5, 20);
        est[8] = new Estudiante("Pedro", 9, "Ingenieria en Sistemas", 4.3, 19);
        est[9] = new Estudiante("Oscar", 7, "Ingenieria en Sistemas", 3.5, 22);
        est[10] = new Estudiante("Sofia", 3, "Ingenieria en Sistemas", 4.5, 20);
        est[11] = new Estudiante("Pedro", 5, "Ingenieria en Sistemas", 4.3, 19);
        est[12] = new Estudiante("Oscar", 9, "Ingenieria en Sistemas", 3.5, 22);
        est[13] = new Estudiante("Sofia", 3, "Ciencias del Deporte", 4.5, 20);
        est[14] = new Estudiante("Pedro", 3, "Leyes", 4.3, 19);
        est[15] = new Estudiante("Oscar", 9, "Ingenieria Automotriz", 3.5, 22);
        est[16] = new Estudiante("Sofia", 1, "Pedagogia Infantil", 4.5, 20);
        //taller de programacion
        String programa = "ingenieria en sistemas";
        int semestre = 3;
        double promedio = sorter(semestre, programa, est);
        System.out.println(
            "Programa: "+programa+
            "\nSemestre: "+semestre+
            "\nPromedio de los estudiantes: "+(promedio == -1 ? "No hay estudiantes en ese programa y semestre" : promedio));

    }

    public static double sorter(int semestre, String programa, Estudiante[] est){
        double promedio = 0.0;
        int cuenta = 0;
        for(int i = 0; i < est.length; i++){
            if(est[i].getSemestre() == semestre && est[i].getPrograma().toLowerCase().equals(programa.toLowerCase())){
                promedio += est[i].getNotaPromedio();
                cuenta++;
            }
        }
        if(cuenta != 0) return promedio / cuenta;
        else return -1;
    }
}