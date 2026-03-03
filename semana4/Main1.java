public class Main1 {
    public static void main(String[] args) {
        //ejercicio
        Matriz matriz = new Matriz();
        int [][] m = matriz.llenarMatrizRandom(6, 6, 30, 1);
        System.out.println(matriz.imprimirMatriz(m));
        System.out.println("El numero mayor es: " + matriz.hallarMax(m));
        System.out.println("El numero menor es: " + matriz.hallarMin(m));
    }
}
