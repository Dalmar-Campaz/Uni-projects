package MatrizPractice;

public class Main {
    public static void main(String[] args) {
        String[] distribuidora = { "Norma", "Caribe", "Alpes" };
        String[] modelo = { "A", "B", "C", "D", "E", "F", "G", "H" };
        int[] precio = { 20000, 50000, 30000, 25000, 10000 };
        Cuaderno[][] matriz = new Cuaderno[4][4];

        llenarMatriz(matriz, precio, distribuidora, modelo);
        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[i].length; j++) {
                System.out.print(matriz[i][j] + " ");
            }
            System.out.println(); // salto de línea después de cada fila
        }
    }

    public static void llenarMatriz(Cuaderno[][] Matriz, int[] precio, String[] distribuidora, String[] modelo) {
        for (int i = 0; i < Matriz.length; i++) {
            for (int j = 0; j < Matriz[i].length; j++) {
                int randomMarca = (int) Math.random() * 3;
                int randomModelo = (int) Math.random() * 8;
                int randomPrecio = (int) Math.random() * 5;
                Matriz[i][j] = new Cuaderno(distribuidora[randomMarca], precio[randomPrecio], modelo[randomModelo]);
            }
        }
    }
}
