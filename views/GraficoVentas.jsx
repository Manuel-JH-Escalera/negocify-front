import React from 'react';
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
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Componente para mostrar gráficos de ventas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.periodo - Periodo a mostrar (anual, mensual, semanal)
 * @param {Array} props.datos - Datos formateados para el gráfico
 * @param {boolean} props.isLoading - Indicador de carga
 */

const GraficoVentas = ({ periodo, datos = [], isLoading }) => {
  // formatear montos
  const formatMonto = (value) => {
    if (value === undefined || value === null) {
      return '$0';
    }
    return `$${value.toLocaleString('es-CL')}`;
  };

  // Mostrar indicador de carga si está cargando
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!datos || datos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos disponibles para mostrar
        </Typography>
      </Box>
    );
  }

  // Si no hay datos, muestra un mensaje
  if (!datos || datos.length === 0) {
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
        data={datos}
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