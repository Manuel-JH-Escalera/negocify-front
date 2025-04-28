import { useMemo } from "react";
import { ajustarAGMT4 } from "../../utils/dateUtils";

const useVentasAnalisis = (ventas = [], filtros = {}) => {
  // Función auxiliar para asegurar que estamos trabajando con números
  const extraerMonto = (venta) => {
    // Convertir explícitamente a número
    const monto = Number(venta.monto_bruto || 0);
    // Verificar que es un número válido
    return isNaN(monto) ? 0 : monto;
  };

  // Filtrar ventas según criterios (fechaInicio, fechaFin)
  const ventasFiltradas = useMemo(() => {
    if (!ventas || ventas.length === 0) return [];
    if (!filtros || (filtros && !filtros.fechaInicio && !filtros.fechaFin)) return ventas;
    
    return ventas.filter(venta => {
      if (!venta.fecha) return false;
      
      const fechaVenta = new Date(venta.fecha);
      
      if (filtros.fechaInicio && filtros.fechaFin) {
        return fechaVenta >= new Date(filtros.fechaInicio) && 
               fechaVenta <= new Date(filtros.fechaFin);
      } else if (filtros.fechaInicio) {
        return fechaVenta >= new Date(filtros.fechaInicio);
      } else if (filtros.fechaFin) {
        return fechaVenta <= new Date(filtros.fechaFin);
      }
      
      return true;
    });
  }, [ventas, filtros]);

  // Depuración
  useMemo(() => {
    if (filtros && (filtros.fechaInicio || filtros.fechaFin)) {
      console.log("Aplicando filtros de fecha:", filtros);
      console.log("Ventas antes de filtrar:", ventas.length);
      console.log("Ventas después de filtrar:", ventasFiltradas.length);
    }
    
    if (ventasFiltradas && ventasFiltradas.length > 0) {
    }
  }, [ventas, ventasFiltradas, filtros]);

  // Calcular datos para análisis según periodo (anual, mensual, semanal)
  const obtenerDatosGrafico = useMemo(() => {
    // Función para obtener datos formateados según el periodo solicitado
    return (periodo) => {
      if (!ventasFiltradas || ventasFiltradas.length === 0) {
        return [];
      }

      switch (periodo) {
        case 'anual': {
          // Agrupar por año
          const ventasPorAnio = ventasFiltradas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const anio = fechaVentaGMT4.getFullYear();
            if (!acc[anio]) {
              acc[anio] = 0;
            }
            acc[anio] += extraerMonto(venta);
            return acc;
          }, {});

          return Object.keys(ventasPorAnio)
          .map(anio => ({
            name: `${anio}`,
            ventas: ventasPorAnio[anio]
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        }
        
        case 'mensual': {
          // Agrupar por mes
          const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          const ventasPorMes = ventasFiltradas.reduce((acc, venta) => {
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
          
          const ventasPorDia = ventasFiltradas.reduce((acc, venta) => {
            if (!venta.fecha) return acc;
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const diaSemana = fechaVentaGMT4.getDay();
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

        case 'ultimosSieteDias': {
          // Agrupar por día específico (últimos 7 días)
          const hoy = new Date();
          const ultimosSiete = [];
          
          // Crear array con las últimas 7 fechas
          for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            ultimosSiete.push({
              fecha: fecha,
              key: fecha.toISOString().split('T')[0],
              label: fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
            });
          }
          
          // Inicializar acumulador con fechas y valores cero
          const acumulador = ultimosSiete.reduce((acc, item) => {
            acc[item.key] = {
              name: item.label,
              ventas: 0,
              fecha: item.fecha,
              orden: item.fecha.getTime()
            };
            return acc;
          }, {});
          
          // Acumular ventas por día
          ventasFiltradas.forEach(venta => {
            if (!venta.fecha) return;
            
            const fechaVentaGMT4 = ajustarAGMT4(venta.fecha);
            const fechaKey = fechaVentaGMT4.toISOString().split('T')[0];
            
            if (acumulador[fechaKey]) {
              acumulador[fechaKey].ventas += extraerMonto(venta);
            }
          });
          
          // Convertir a array y ordenar por fecha
          return Object.values(acumulador).sort((a, b) => a.orden - b.orden);
        }
        
        default:
          return [];
      }
    };
  }, [ventasFiltradas]);

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      return {
        totalVentas: 0,
        ventaPromedio: 0,
        ventaMaxima: 0,
        ventaMinima: 0,
        totalRegistros: 0
      };
    }

    // valores numéricos para los montos
    const montos = ventasFiltradas.map(v => extraerMonto(v));
    const total = montos.reduce((sum, monto) => sum + monto, 0);
    
    return {
      totalVentas: total,
      ventaPromedio: total / ventasFiltradas.length,
      ventaMaxima: Math.max(...montos),
      ventaMinima: Math.min(...montos),
      totalRegistros: ventasFiltradas.length
    };
  }, [ventasFiltradas]);

  // Distribución por método de pago
  const distribucionMetodosPago = useMemo(() => {
    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      return [];
    }

    const metodoPagoMap = {
      1: 'Efectivo',
      2: 'Tarjeta',
      3: 'Transferencia',
    };

    const distribucion = ventasFiltradas.reduce((acc, venta) => {
      // Obtener el nombre del método de pago basado en tipo_venta_id
      const metodoPago = metodoPagoMap[venta.tipo_venta_id] || `Desconocido (${venta.tipo_venta_id})`;
      
      if (!acc[metodoPago]) {
        acc[metodoPago] = {
          count: 0,
          total: 0
        };
      }
      
      acc[metodoPago].count += 1;
      acc[metodoPago].total += extraerMonto(venta);
      
      return acc;
    }, {});

    return Object.keys(distribucion).map(metodo => ({
      name: metodo,
      count: distribucion[metodo].count,
      total: distribucion[metodo].total
    }));
  }, [ventasFiltradas]);

  return {
    obtenerDatosGrafico,
    estadisticas,
    distribucionMetodosPago,
    ventasFiltradas
  };
};

export default useVentasAnalisis;