package Pilas.ejercicio1;

import java.util.Stack;

public class ValidarExpresion {
    private boolean coinciden(char cierre, char apertura) {
        return (apertura == '(' && cierre == ')') ||
                (apertura == '{' && cierre == '}') ||
                (apertura == '[' && cierre == ']');
    }

    public boolean validar(String exp) {
        Stack<Character> pila = new Stack<>();

        for (int i = 0; i < exp.length(); i++) {
            char caracter = exp.charAt(i);

            if (caracter == '(' || caracter == '{' || caracter == '[') {
                pila.push(caracter);

            } else if (caracter == ')' || caracter == '}' || caracter == ']') {
                if (pila.empty()) {
                    return false;
                }

                if (!coinciden(caracter, pila.pop())) {
                    return false;
                }
            }
        }
        return pila.empty();
    }

}
