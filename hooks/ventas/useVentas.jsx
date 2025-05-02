import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import useUserStore from "../../stores/userStore";
import { formatearFechaGMT4, sonMismoDiaGMT4, debugFecha } from "../../utils/dateUtils";
import useTipoVenta from "./useTipoVenta";


const useVentas = (almacenId) => {
  const { userToken } = useUserStore();
  const [fechaFiltro, setFechaFiltro] = useState(null);

  const { data: tiposVentaData } = useTipoVenta();

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
    const tipoVentaMap = {};
    if (tiposVentaData) {
      tiposVentaData.forEach(tipo => {
        tipoVentaMap[tipo.id] = tipo.nombre;
      });
    }

    const ventasArray = Array.isArray(ventasData.data) ? ventasData.data: [];
    return ventasArray.map(venta => ({
      ...venta,
      metodoPago: tipoVentaMap[venta.tipo_venta_id] || `Desconocido (${venta.tipo_venta_id})`
    }));
  }, [ventasData, tiposVentaData]);

  // Filtrar ventas por fecha si hay un filtro activo
  const ventasFiltradas = useMemo(() => {
    if (!ventasOriginal || ventasOriginal.length === 0) {
      return [];
    }

    if (!fechaFiltro) return ventasOriginal;

    const resultadoFiltrado = ventasOriginal.filter((venta) => {
      if (!venta.fecha) {
        console.log("Venta sin fecha:", venta);
        return false;
      }

      const fechaVentaFormateada = formatearFechaGMT4(venta.fecha);
      
      //si formato coincide
      const coincide = fechaVentaFormateada === fechaFiltro;
      if (coincide) {
      }
      return coincide;
    });

    return resultadoFiltrado;
  }, [ventasOriginal, fechaFiltro]);

  return {
    ventas: ventasFiltradas,
    ventasOriginal,
    isLoading,
    isError,
    error,
    fechaFiltro,
    setFechaFiltro,
    calcularMontoNeto
  };
};

export default useVentas;
