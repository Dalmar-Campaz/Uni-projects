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
        // nota promedio de los estudiantes de 3ro

        double sorter(int semestre, String programa){
        double notas = 0.0;
        for (int i = 0; i < est.length; i++) {
            if (est[i].getSemestre() == 3) {
                notas += est[i].getNotaPromedio();
            }
        }
        }

    }
}