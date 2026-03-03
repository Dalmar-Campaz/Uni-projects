public class Matriz {

    public int [][] llenarMatrizRandom(int filas, int columnas, int max, int min) {
        int [][] matriz = new int[filas][columnas];

        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[0].length; j++) {
                matriz[i][j] = (int) (Math.random() * (max - min + 1)) + min;
            }
        }
        return matriz;
    }
    public String imprimirMatriz(int [][] matriz) {
        String cad = "";
        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[0].length; j++) {
                cad += matriz[i][j] + " ";
            }
            cad += "\n";
        }
        return cad;
    }
    public int hallarMax(int [][] matriz) {
        int max = matriz[0][0];
        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[0].length; j++) {
                if (matriz[i][j] > max) {
                    max = matriz[i][j];
                }
            }
        }
        return max;
    }
    public int hallarMin(int [][] matriz) {
        int min = matriz[0][0];
        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[0].length; j++) {
                if (matriz[i][j] < min) {
                    min = matriz[i][j];
                }
            }
        }
        return min;
    }
}
