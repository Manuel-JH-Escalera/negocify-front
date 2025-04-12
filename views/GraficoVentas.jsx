import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Box, Typography } from '@mui/material';

const GraficoVentas = ({ periodo, ventas }) => {
  // formatear montos
  const formatMonto = (value) => {
    if (value === undefined || value === null) {
      return '$0';
    }
    return `$${value.toLocaleString('es-CL')}`;
  };

  // Función simple para obtener el año de una fecha
  const getYear = (dateString) => {
    try {
      return new Date(dateString).getFullYear();
    } catch (error) {
      console.error("Error al obtener el año:", error);
      return 0;
    }
  };

  // Función simple para obtener el mes de una fecha (0-11)
  const getMonth = (dateString) => {
    try {
      return new Date(dateString).getMonth();
    } catch (error) {
      console.error("Error al obtener el mes:", error);
      return 0;
    }
  };

  // día de la semana (0-6, donde 0 es domingo)
  const getDayOfWeek = (dateString) => {
    try {
      return new Date(dateString).getDay();
    } catch (error) {
      console.error("Error al obtener el día de la semana:", error);
      return 0;
    }
  };

  // Generar datos para el gráfico según el periodo seleccionado
  const chartData = useMemo(() => {
    if (!ventas || !Array.isArray(ventas) || ventas.length === 0) {
      return [];
    }

    switch (periodo) {
      case 'anual': {
        // Agrupar por año
        const ventasPorAnio = ventas.reduce((acc, venta) => {
          if (!venta.fecha) return acc;
          
          const anio = getYear(venta.fecha);
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
          
          const mes = getMonth(venta.fecha);
          if (!acc[mes]) {
            acc[mes] = 0;
          }
          acc[mes] += venta.monto || 0;
          return acc;
        }, {});

        return Object.keys(ventasPorMes).map(mes => ({
          name: meses[parseInt(mes, 10)],
          ventas: ventasPorMes[mes]
        }));
      }
      
      case 'semanal': {
        // Agrupar por día de la semana
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        const ventasPorDia = ventas.reduce((acc, venta) => {
          if (!venta.fecha) return acc;
          
          const diaSemana = getDayOfWeek(venta.fecha);
          if (!acc[diaSemana]) {
            acc[diaSemana] = 0;
          }
          acc[diaSemana] += venta.monto || 0;
          return acc;
        }, {});

        return Object.keys(ventasPorDia).map(dia => ({
          name: diasSemana[parseInt(dia, 10)],
          ventas: ventasPorDia[dia]
        }));
      }
      
      default:
        return [];
    }
  }, [periodo, ventas]);

  // Si no hay datos, muestra un mensaje
  if (chartData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos disponibles para mostrar
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
          tickFormatter={(value) => formatMonto(value)}
        />
        <Tooltip 
          formatter={(value) => [formatMonto(value), 'Ventas']}
        />
        <Legend />
        <Bar dataKey="ventas" name="Ventas" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficoVentas;