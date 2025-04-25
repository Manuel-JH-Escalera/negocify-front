import { useMemo } from "react";
import { ajustarAGMT4 } from "../../utils/dateUtils";


const useVentasAnalisis = (ventas = []) => {
  // Función auxiliar para asegurar que estamos trabajando con números
  const extraerMonto = (venta) => {
    // Convertir explícitamente a número
    const monto = Number(venta.monto_bruto || 0);
    // Verificar que es un número válido
    return isNaN(monto) ? 0 : monto;
  };

  // log para depuración
  useMemo(() => {
    if (ventas && ventas.length > 0) {
      console.log("Primera venta para análisis:", ventas[0]);
      console.log("Monto de la primera venta (convertido a número):", extraerMonto(ventas[0]));
    }
  }, [ventas]);

  // Calcular datos para análisis según periodo (anual, mensual, semanal)
  const obtenerDatosGrafico = useMemo(() => {
    // Función para obtener datos formateados según el periodo solicitado
    return (periodo) => {
      if (!ventas || ventas.length === 0) {
        console.log("No hay ventas para el gráfico");
        return [];
      }

      console.log(`Generando datos para gráfico ${periodo} con ${ventas.length} ventas`);

      switch (periodo) {
        case 'anual': {
          // Agrupar por año
          const ventasPorAnio = ventas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const anio = fechaVentaGMT4.getFullYear();
            if (!acc[anio]) {
              acc[anio] = 0;
            }
            acc[anio] += extraerMonto(venta);
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
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const mes = fechaVentaGMT4.getMonth();
            if (!acc[mes]) {
              acc[mes] = 0;
            }
            acc[mes] += extraerMonto(venta);
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
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const diaSemana = new Date(venta.fecha).getDay();
            if (!acc[diaSemana]) {
              acc[diaSemana] = 0;
            }
            acc[diaSemana] += extraerMonto(venta);
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

    // valores numéricos para los montos
    const montos = ventas.map(v => extraerMonto(v));
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
      //campo metodoPAgo de useVentas.jsx
      if (!venta.metodoPago) return acc;
      
      if (!acc[venta.metodoPago]) {
        acc[venta.metodoPago] = {
          count: 0,
          total: 0
        };
      }
      
      acc[venta.metodoPago].count += 1;
      acc[venta.metodoPago].total += extraerMonto(venta);
      
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