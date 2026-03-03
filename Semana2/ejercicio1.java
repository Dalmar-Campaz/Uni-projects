public class ejercicio1 {
    public static void main(String[] args) {
        
        //1st form: definiendo valores
        int[] v = {2, 4, 5, 7, 9, 2, 15};
        
        //impresion
        System.out.print("v = [");
        for (int i = 0; i < v.length; i++){
            if (i < v.length-1)
            System.out.print(v[i]+", ");
            else
            System.out.println(v[i] + "]");
        }
        //sumas
        int sumaPar = 0;
        int sumaImPar = 0;
        for(int i = 0; i < v.length; i++){
            if(v[i]%2 == 0){
                sumaPar += v[i];
            }
            else{
                sumaImPar += v[i];
            }
        }
        System.out.println("Suma de pares = "+ sumaPar);
        System.out.println("Suma de inpares = "+ sumaImPar);

    }
}
