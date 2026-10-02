package Pilas.ejercicio1;

public class Main {
    public static void main(String[] args) {

        ValidarExpresion val = new ValidarExpresion();
        String exp1 = "((a+b)*5) - 7";
        String exp2 = "2*[(a+b)/2.5 + x - 7*y";

        if (val.validar(exp1))
        System.out.println("\nLa expresion: " + exp1 + "\nEs valida");
        else
        System.out.println("\nLa expresion: " + exp1 + "\nNo es valida");

        if (val.validar(exp2))
        System.out.println("\nLa expresion: " + exp2 + "\nEs valida");
        else
        System.out.println("\nLa expresion: " + exp2 + "\nNo es valida");

    }
}
