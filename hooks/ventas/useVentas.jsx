import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo } from "react";
import useUserStore from "../../stores/userStore";

/**
 * Hook para obtener las ventas de un almacén específico
 * @param {string|number} almacenId - ID del almacén
 */
const useVentas = (almacenId) => {
    const { userToken } = useUserStore();
    const [fechaFiltro, setFechaFiltro] = useState(null);
  
    // Configurar la consulta de React Query
    const {
      data: ventasData,
      isLoading,
      isError,
      error,
      refetch
    } = useQuery({
      queryKey: ["ventas", almacenId],
      queryFn: async () => {
        if (!almacenId || !userToken) {
          throw new Error("Se requiere ID de almacén y token");
        }
  
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ventas/almacen/${almacenId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          }
        );
  
        if (response.data && response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data?.message || "Error al obtener ventas");
        }
      },
      enabled: !!almacenId && !!userToken
    });
  
    // Filtrar ventas por fecha si hay un filtro activo
    const ventasFiltradas = useMemo(() => {
      if (!ventasData) return [];
      
      if (!fechaFiltro) return ventasData;
      
      return ventasData.filter(venta => {
        const fechaVenta = new Date(venta.fecha).toISOString().split("T")[0];
        return fechaVenta === fechaFiltro;
      });
    }, [ventasData, fechaFiltro]);
  
    return {
      ventas: ventasFiltradas,
      ventasOriginal: ventasData,
      isLoading,
      isError,
      error,
      refetch,
      fechaFiltro,
      setFechaFiltro
    };
  };
  
  export default useVentas;