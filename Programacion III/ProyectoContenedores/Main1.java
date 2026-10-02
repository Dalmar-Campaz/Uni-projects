import java.util.ArrayList;
import java.util.Scanner;

public class Main1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // buques
        Buque[] buques = new Buque[10];

        Contenedor contenedor1 = new Contenedor(1000, "España", 1);
        buques[0] = new Buque(1, new Contenedor[10][10]);
        buques[0].contenedores[9][9] = contenedor1;
        // System.out.println(buques[0].contenedores[9][9]);

        // menu
        boolean salir = false;
        do {
            System.out.println(
                    "Bienvenido al sistema de buques y contenedores, que desea hacer?"
                            + "\n1. Registrar un buque"
                            + "\n2. Resgistrar un contenedor"
                            + "\n3. Mostrar el peso total de los contenedores de un buque"
                            + "\n4. Listar de manera ordenada el origen de los contenedores de un buque"
                            + "\n5. Salir");
            int opcion = sc.nextInt();

            switch (opcion) {
                case 1:
                    for (int i = 0; i < buques.length; i++) {
                        if (buques[i] == null) {
                            System.out.println("Ingrese el id del buque: ");
                            int id = sc.nextInt();
                            buques[i] = new Buque(id, new Contenedor[10][10]);
                        } else {
                            System.out.println("No se pueden registrar mas buques");
                            break;
                        }
                    }
                    break;
                case 2:
                    System.out.println("Ingrese el id del buque al que desea agregar el contenedor: ");
                    int idBuque = sc.nextInt();
                    boolean agregado = false; // indica si ya agregamos un contenedor

                    for (int i = 0; i < buques.length && !agregado; i++) {
                        if (buques[i] != null && buques[i].id == idBuque) {
                            for (int j = buques[i].contenedores.length - 1; j >= 0 && !agregado; j--) {
                                for (int k = buques[i].contenedores[0].length - 1; k >= 0 && !agregado; k--) {
                                    if (buques[i].contenedores[j][k] == null) {
                                        System.out.println("Ingrese el id del contenedor: ");
                                        int idContenedor = sc.nextInt();
                                        System.out.println("Ingrese el peso del contenedor: ");
                                        int peso = sc.nextInt();
                                        System.out.println("Ingrese el origen del contenedor: ");
                                        String origen = sc.next();
                                        Contenedor contenedor = new Contenedor(peso, origen, idContenedor);
                                        buques[i].contenedores[j][k] = contenedor;

                                        agregado = true;

                                        for (int filas = 0; filas < buques[i].contenedores.length; filas++) {
                                            for (int columnas = 0; columnas < buques[i].contenedores[0].length; columnas++) {
                                                if (buques[i].contenedores[filas][columnas] != null) {
                                                    System.out.print("X ");
                                                } else {
                                                    System.out.print("O ");
                                                }
                                            }
                                            System.out.println();
                                        }
                                    }
                                }
                            }
                            if (!agregado) {
                                System.out.println("No se pueden agregar más contenedores a este buque.");
                            }

                        } else {
                            System.out.println("No se encontro el buque con el id " + idBuque);
                        }
                    }
                    break;
                case 3:
                    System.out.println(
                            "Ingrese el id del buque del que desea conocer el peso total de los contenedores: ");
                    int idBuque2 = sc.nextInt();
                    for (int i = 0; i < buques.length; i++) {
                        if (buques[i] != null && buques[i].id == idBuque2) {
                            double pesoTotal = 0;
                            for (int j = 0; j < buques[i].contenedores.length; j++) {
                                for (int k = 0; k < buques[i].contenedores[0].length; k++) {
                                    if (buques[i].contenedores[j][k] != null) {
                                        pesoTotal += buques[i].contenedores[j][k].peso;
                                    }
                                }
                            }
                            System.out.println(
                                    "El peso total de los contenedores del buque con id " + idBuque2 + " es: "
                                            + pesoTotal);
                        } else {
                            System.out.println("No se encontro el buque con el id " + idBuque2);
                            break;
                        }
                    }
                    break;
                case 4:
                    System.out
                            .println("Ingrese el id del buque del que desea listar los orígenes de los contenedores: ");
                    int idBuque3 = sc.nextInt();
                    ArrayList<String> origenes = new ArrayList<>();
                    for (int i = 0; i < buques.length; i++) {
                        if (buques[i] != null && buques[i].id == idBuque3) {
                            for (int j = 0; j < buques[i].contenedores.length; j++) {
                                for (int k = 0; k < buques[i].contenedores[0].length; k++) {
                                    String origen = buques[i].contenedores[j][k] != null
                                            ? buques[i].contenedores[j][k].origen
                                            : null;
                                    if (origen != null && !origenes.contains(origen)) {
                                        origenes.add(origen);
                                    }
                                }
                            }
                            for (String origen : origenes) {
                                System.out.println("Contenedores de " + origen + " del buque " + idBuque3 + ":");
                                for (int j = 0; j < buques[i].contenedores.length; j++) {
                                    for (int k = 0; k < buques[i].contenedores[j].length; k++) {
                                        if (buques[i].contenedores[j][k].origen.equals(origen)) {
                                            System.out.println("- Contenedor " + buques[i].contenedores[j][k].id +
                                                    ", peso " + buques[i].contenedores[j][k].peso + "kg");
                                        }
                                    }
                                }
                            }
                        } else {
                            System.out.println("No se encontro el buque con el id " + idBuque3);
                            break;
                        }
                    }

                    break;
                case 5:
                    salir = true;
                    break;
            }
        } while (!salir);
    }
}
