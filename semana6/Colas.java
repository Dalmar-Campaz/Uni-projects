package semana6;

import java.util.ArrayDeque;
import java.util.Queue;

public class Colas {
    public static void main(String[] args) {
        Queue<Integer> cola = new ArrayDeque<>();
        cola.add(32);
        cola.add(22);
        cola.add(35);
        cola.add(46);
        cola.add(57);
        cola.add(68);
        cola.add(71);
        cola.add(84);
        cola.add(99);

/*         // mostrar la cola
        System.out.println(cola);

        // verificar el primer elemento de la cola
        System.out.println("\nPrimer elemento: " + cola.element());

        // agregar un nuevo elemento a la cola offer
        cola.offer(100);
        System.out.println(cola);

        // mostrar con peek el primer elemento de la cola sin eliminarlo
        System.out.println("\nPrimer elemento con peek: " + cola.peek());
        System.out.println(cola);

        // eliminar con poll el primer elemento de la cola
        System.out.println("\nPrimer elemento eliminado: " + cola.poll());
        System.out.println(cola);

        // eliminar con remove el primer elemento de la cola
        System.out.println("\nPrimer elemento eliminado con remove: " + cola.remove());

        // mostrar la cola
        System.out.println(cola);

        // obtener tamaño de la cola
        System.out.println("\nTamaño de la cola: " + cola.size()); */

        // Activity
        System.out.println("\nActividad:");

        System.out.println(cola);
        //remove and contains
        if (cola.contains(22)) {
            cola.remove(22);
        }
        System.out.println("cola sin el 22: " + cola);

        // clear
        cola.clear();

        // isEmpty
        if (cola.isEmpty())
            System.out.println("La cola está vacía");
    }
}
