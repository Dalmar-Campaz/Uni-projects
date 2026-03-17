package semana6;

import java.util.Stack;

public class Pilas {
    public static void main(String[] args) {
        Stack<String> pila = new Stack<>();
        pila.push("Dalmar");
        pila.push("Gyasi");
        pila.push("Campaz");
        pila.push("Vidal");
        pila.push("Vidal");

        System.out.println("Pila: " + pila);
        System.out.println("Elemento superior: " + pila.peek());
        System.out.println("Elemento eliminado: " + pila.pop());
        System.out.println("Nuevo elemento superior: " + pila.peek());
        System.out.println("Posición de Dalmar: " + pila.search("Dalmar"));

        // Activity
        System.out.println("\nActividad:");
        //add
        pila.add("samuel");
        //remove
        pila.remove(4);
        //get
        System.out.println(pila.get(2));
        //indexOf
        System.out.println(pila.indexOf("Vidal"));
    }
}
