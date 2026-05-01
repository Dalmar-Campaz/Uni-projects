import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Scanner;

public class MapsAndLists {

    public static void main(String[] args) {

        LinkedList<String> anaLista = new LinkedList<>();
                anaLista.add("Camisa");
                        anaLista.add("Pantalon");

                                LinkedList<String> luisLista = new LinkedList<>();
                                        luisLista.add("Zapatos");

                                                //-----------------------------------------------------------------------------------------------------------

                                                        Map<String, LinkedList<String>> pedidos = new HashMap<>();
                                                                pedidos.put("Ana", anaLista);
                                                                        pedidos.put("Luis", luisLista);

                                                                                System.out.println("Cantidad de productos de Ana: " + pedidos.get("Ana").size());

                                                                                        Scanner sc = new Scanner(System.in);
                                                                                                System.out.println("Ingrese el producto que quiere agregar a la lista de luis...");
                                                                                                        String producto = sc.next();
                                                                                                                pedidos.get("Luis").add(producto);
                                                                                                                        System.out.println(pedidos.get("Luis"));
    }
}  