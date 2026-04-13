package Colas.ejercicio2;

import java.util.Queue;
import java.util.ArrayDeque;
import java.util.ArrayList;

public class Supermercado {

    Queue<Integer> caja1 = new ArrayDeque<>();
    Queue<Integer> caja2 = new ArrayDeque<>();
    Queue<Integer> caja3 = new ArrayDeque<>();
    Queue<Integer> caja4 = new ArrayDeque<>();

    Queue<Integer> fila = new ArrayDeque<>();

    boolean caja4Activa = false;

    int clientesAtendidos = 0;
    int maxFila = 0;
    double tiempoCaja4 = 0;

    double tiempoMaxEspera = 0;

    public void simular() {

        int tiempoTotal = 420;

        for (int minuto = 0; minuto < tiempoTotal; minuto++) {

            int clientesIngresados = (int) (Math.random() * 3);

            for (int i = 0; i < clientesIngresados; i++) {
                fila.add(minuto);
            }

            if (fila.size() > 20) {
                caja4Activa = true;
            }

            Queue<Integer> caja;

            while (!fila.isEmpty() && (caja = cajaLibreRandom()) != null) {
                caja.add(fila.poll());
            }

            atender(caja1, minuto);
            atender(caja2, minuto);
            atender(caja3, minuto);

            if (caja4Activa) {
                atender(caja4, minuto);
            }

            if (fila.isEmpty() && caja4.isEmpty()) {
                caja4Activa = false;
            }

            if (fila.size() > maxFila) {
                maxFila = fila.size();
            }
        }

        double promedioFila = (double) (maxFila) / 2;

        System.out.println("Clientes atendidos: " + clientesAtendidos);
        System.out.println("Fila máxima: " + maxFila);
        System.out.println("Fila promedio (aprox): " + promedioFila);
        System.out.println("Tiempo máximo espera: " + tiempoMaxEspera);
        System.out.println("Tiempo caja 4 abierta: " + tiempoCaja4);
    }

    private Queue<Integer> cajaLibreRandom() {
        Queue<Integer>[] cajas = new Queue[] { caja1, caja2, caja3, caja4 };

        ArrayList<Queue<Integer>> libres = new ArrayList<>();

        for (int i = 0; i < cajas.length; i++) {
            if (i == 3 && !caja4Activa)
                continue;

            if (cajas[i].isEmpty()) {
                libres.add(cajas[i]);
            }
        }

        if (libres.isEmpty())
            return null;

        int index = (int) (Math.random() * libres.size());
        return libres.get(index);
    }

    private void pasarClientes(Queue<Integer> caja) {
        if (caja.isEmpty() && !fila.isEmpty()) {
            caja.add(fila.poll());
        }
    }

    private void atender(Queue<Integer> caja, int minuto) {
        if (!caja.isEmpty()) {
            int llegada = caja.poll();
            int espera = minuto - llegada;

            if (espera > tiempoMaxEspera) {
                tiempoMaxEspera = espera;
            }

            clientesAtendidos++;
        }
    }
}