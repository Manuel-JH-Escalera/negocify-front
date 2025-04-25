import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import useUserStore from "../../stores/userStore";
import { formatearFechaGMT4, sonMismoDiaGMT4, debugFecha } from "../../utils/dateUtils";

// Mapeo de IDs a nombres de métodos de pago
const metodoPagoMap = {
  1: 'Efectivo',
  2: 'Tarjeta',
  3: 'Transferencia'
};

const useVentas = (almacenId) => {
  const { userToken } = useUserStore();
  const [fechaFiltro, setFechaFiltro] = useState(null);

  const calcularMontoNeto = (monto_bruto) => {
    // Verificamos que el monto bruto sea un número válido
    if (isNaN(parseFloat(monto_bruto)) || !isFinite(monto_bruto)) {
      console.error('El monto bruto debe ser un número válido');
      return 0;
    }
    
    // Convertimos a número para asegurar la operación matemática correcta
    const montoBrutoNumerico = parseFloat(monto_bruto);
    const IVA = 0.19;
    
    // Cálculo del monto neto (dividiendo el monto bruto por 1.19)
    // Fórmula: montoNeto = montoBruto / (1 + IVA)
    const montoNeto = montoBrutoNumerico / (1 + IVA);
    
    // Redondeamos a 2 decimales para mayor precisión en temas monetarios
    return Math.round(montoNeto * 100) / 100;
  };

  const fetchVentas = async () => {
    if (!almacenId) {
      console.error("No hay almacenId disponible", almacenId);
      return { data: [] };
    }

    if (!userToken) {
      console.error("No hay token de usuario disponible");
      return { data: [] };
    }

    const url = `${
      import.meta.env.VITE_BACK_URL
    }api/ventas/almacen/${almacenId}`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    try {
      console.log(`Fetching ventas from: ${url}`);
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error de respuesta: ${response.status} ${response.statusText}`,
          errorText
        );
        return { data: [] };
      }

      const result = await response.json();
      console.log(`Ventas recibidas para almacenId ${almacenId}:`, result);

      // Asegúrate de que la estructura de datos sea consistente con lo que espera tu componente
      return result;
    } catch (err) {
      console.error(`Error al obtener ventas para almacenId ${almacenId}:`, err.message);
      return { data: [] };
    }
  };

  // Consulta usando React Query
  const {
    data: ventasData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ventas", almacenId],
    queryFn: fetchVentas,
    enabled: !!userToken && !!almacenId,
  });

  // Datos originales de ventas (sin filtrar)
  const ventasOriginal = useMemo(() => {
    if (!ventasData) return [];
    const ventasArray = Array.isArray(ventasData.data) ? ventasData.data: [];
    return ventasArray.map(venta => ({
      ...venta,
      metodoPago: metodoPagoMap[venta.tipo_venta_id] || `Desconocido (${venta.tipo_venta_id})`
    }));
  }, [ventasData]);

  // Filtrar ventas por fecha si hay un filtro activo
  const ventasFiltradas = useMemo(() => {
    if (!ventasOriginal || ventasOriginal.length === 0) {
      return [];
    }

    if (!fechaFiltro) return ventasOriginal;

    console.log("Filtrando ventas por fecha:", fechaFiltro);
    console.log("Total de ventas antes de filtrar:", ventasOriginal.length);

    const resultadoFiltrado = ventasOriginal.filter((venta) => {
      if (!venta.fecha) {
        console.log("Venta sin fecha:", venta);
        return false;
      }

      const fechaVentaFormateada = formatearFechaGMT4(venta.fecha);

      // Debug info (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        debugFecha(venta.fecha, `Venta ${venta.id}`);
        console.log(`Fecha filtro: ${fechaFiltro}`);
      }
      
      //si formato coincide
      const coincide = fechaVentaFormateada === fechaFiltro;
      if (coincide) {
        console.log("Venta coincide con filtro:", venta);
      }

      return coincide;
    });

    console.log("Total de ventas después de filtrar:", resultadoFiltrado.length);

    return resultadoFiltrado;
  }, [ventasOriginal, fechaFiltro]);

  console.log("Estado del hook useVentas:", {
    almacenId,
    totalVentasOriginal: ventasOriginal.length,
    totalVentasFiltradas: ventasFiltradas.length,
    fechaFiltro
  });

  return {
    ventas: ventasFiltradas,
    ventasOriginal,
    isLoading,
    isError,
    error,
    fechaFiltro,
    setFechaFiltro,
    refetch,
    calcularMontoNeto
  };
};

export default useVentas;
