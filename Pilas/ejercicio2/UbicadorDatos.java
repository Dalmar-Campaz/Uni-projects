package Pilas.ejercicio2;

import java.util.Stack;

public class UbicadorDatos {
    private Stack<Integer>[] p;

    public UbicadorDatos(int n) {
        p = new Stack[n];
        for (int j = 0; j < n; j++) {
            p[j] = new Stack<>();
        }
    }

    public void ubicar(int i, int j) {
        int abs = Math.abs(i);
        if (abs <= p.length && abs >= 1) {
            if (i > 0) {
                p[abs - 1].push(j);
            } else if (i < 0) {
                if (!p[abs - 1].empty())
                    p[abs - 1].pop();
                else System.out.println("La pila numero " + abs +" esta vacia, no se pueden quitar elementos");
            }
        } 
    }
}
