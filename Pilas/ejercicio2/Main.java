package Pilas.ejercicio2;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner s = new Scanner(System.in);
        int n = 5;
        UbicadorDatos ubicador = new UbicadorDatos(5);

        while (true) {
            System.out.println("\ningrese un numero para i entre -"+n+" y " + n
                    + ", ingrese 0 para finalizar el proceso de entrada de datos");
            int i = s.nextInt();

            if (i == 0)
                break;

            if (i > 0) {
                System.out.println("\ningrese un numero para j");
                int j = s.nextInt();
                ubicador.ubicar(i, j);
            } else {
                ubicador.ubicar(i, 0);
            }

        }

    }
}
