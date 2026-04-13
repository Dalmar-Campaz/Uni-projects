package Colas;

import java.util.ArrayDeque;
import java.util.Queue;

public class Supermercado {
    Queue<Integer> caja1 = new ArrayDeque<>();
    Queue<Integer> caja2 = new ArrayDeque<>();
    Queue<Integer> caja3 = new ArrayDeque<>();

    Queue<Integer> esperandoCarrito = new ArrayDeque<>();
    Queue<Integer> comprando = new ArrayDeque<>();

    int carritos = 25;

    public void simular() {
        for (int i = 0; i < 30; i++) {
            if (hayCarritos()) {
                carritos--;
                comprando.add(1);
            } else {
                esperandoCarrito.add(1);
            }

            if (!comprando.isEmpty() && Math.random() < 0.5) {
                Queue<Integer> menor = colaMasCorta();
                menor.add(comprando.poll());
            }

            atender(caja1);
            atender(caja2);
            atender(caja3);

            while(carritos > 0 && !esperandoCarrito.isEmpty()){
                esperandoCarrito.poll();
                carritos--;
                comprando.add(1);
            }
        }
    }

    Queue<Integer> colaMasCorta() {
        Queue<Integer> menor = caja1;

        if (caja2.size() < menor.size())
            menor = caja2;

        if (caja3.size() < menor.size())
            menor = caja3;

        return menor;
    }

    private boolean hayCarritos() {
        return carritos > 0;
    }

    private void atender(Queue<Integer> caja) {
        if (!caja.isEmpty()) {
            caja.remove();
            carritos++;
        }
    }
}
