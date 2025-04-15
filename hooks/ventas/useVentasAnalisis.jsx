// hooks/ventas/useVentasAnalisis.js
import { useMemo } from "react";

/**
 * Hook para analizar datos de ventas y generar estadísticas
 * @param {Array} ventas - Array de objetos de ventas
 */
const useVentasAnalisis = (ventas = []) => {
  // Calcular datos para análisis según periodo (anual, mensual, semanal)
  const obtenerDatosGrafico = useMemo(() => {
    // Función para obtener datos según el periodo solicitado
    return (periodo) => {
      if (!ventas || ventas.length === 0) {
        return [];
      }

      switch (periodo) {
        case 'anual': {
          // Agrupar por año
          const ventasPorAnio = ventas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const anio = new Date(venta.fecha).getFullYear();
            if (!acc[anio]) {
              acc[anio] = 0;
            }
            acc[anio] += venta.monto || 0;
            return acc;
          }, {});

          return Object.keys(ventasPorAnio).map(anio => ({
            name: `${anio}`,
            ventas: ventasPorAnio[anio]
          }));
        }
        
        case 'mensual': {
          // Agrupar por mes
          const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          const ventasPorMes = ventas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const mes = new Date(venta.fecha).getMonth();
            if (!acc[mes]) {
              acc[mes] = 0;
            }
            acc[mes] += venta.monto || 0;
            return acc;
          }, {});

          return Object.keys(ventasPorMes)
            .map(mes => ({
              name: meses[parseInt(mes, 10)],
              ventas: ventasPorMes[mes],
              orden: parseInt(mes, 10) // Para ordenar correctamente
            }))
            .sort((a, b) => a.orden - b.orden);
        }
        
        case 'semanal': {
          // Agrupar por día de la semana
          const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          
          const ventasPorDia = ventas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const diaSemana = new Date(venta.fecha).getDay();
            if (!acc[diaSemana]) {
              acc[diaSemana] = 0;
            }
            acc[diaSemana] += venta.monto || 0;
            return acc;
          }, {});

          return Object.keys(ventasPorDia)
            .map(dia => ({
              name: diasSemana[parseInt(dia, 10)],
              ventas: ventasPorDia[dia],
              orden: parseInt(dia, 10) // Para ordenar correctamente
            }))
            .sort((a, b) => a.orden - b.orden);
        }
        
        default:
          return [];
      }
    };
  }, [ventas]);

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    if (!ventas || ventas.length === 0) {
      return {
        totalVentas: 0,
        ventaPromedio: 0,
        ventaMaxima: 0,
        ventaMinima: 0,
        totalRegistros: 0
      };
    }

    const montos = ventas.map(v => v.monto || 0);
    const total = montos.reduce((sum, monto) => sum + monto, 0);
    
    return {
      totalVentas: total,
      ventaPromedio: total / ventas.length,
      ventaMaxima: Math.max(...montos),
      ventaMinima: Math.min(...montos),
      totalRegistros: ventas.length
    };
  }, [ventas]);

  // Calcular distribución por método de pago
  const distribucionMetodosPago = useMemo(() => {
    if (!ventas || ventas.length === 0) {
      return [];
    }

    const distribucion = ventas.reduce((acc, venta) => {
      if (!venta.metodoPago) return acc;
      
      if (!acc[venta.metodoPago]) {
        acc[venta.metodoPago] = {
          count: 0,
          total: 0
        };
      }
      
      acc[venta.metodoPago].count += 1;
      acc[venta.metodoPago].total += venta.monto || 0;
      
      return acc;
    }, {});

    return Object.keys(distribucion).map(metodo => ({
      name: metodo,
      count: distribucion[metodo].count,
      total: distribucion[metodo].total
    }));
  }, [ventas]);

  return {
    obtenerDatosGrafico,
    estadisticas,
    distribucionMetodosPago
  };
};

export default useVentasAnalisis;