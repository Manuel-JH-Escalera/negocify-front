import { useQuery } from "@tanstack/react-query";

function useValorDolar() {
    const fetchValorDolar = async () => {
      try {
        const response = await fetch("https://mindicador.cl/api/dolar");
        
        if (!response.ok) {
          throw new Error("Error al obtener el valor del dólar");
        }
        
        const data = await response.json();
        const latestValue = data.serie[0]?.valor;
        
        if (isNaN(parseFloat(latestValue))) {
          throw new Error("Valor de dólar no válido");
        }
        
        return {
          valor: parseFloat(latestValue),
          fecha: data.serie[0]?.fecha,
          nombre: data.nombre,
          unidad_medida: data.unidad_medida
        };
      } catch (error) {
        console.error("Error al obtener valor del dólar:", error);
        throw error;
      }
    };
  
    return useQuery({
      queryKey: ["valorDolar"],
      queryFn: fetchValorDolar,
      staleTime: 1000 * 60 * 60, // 1 hora
      cacheTime: 1000 * 60 * 60 * 24, // 24 horas
    });
  }

  export default useValorDolar;