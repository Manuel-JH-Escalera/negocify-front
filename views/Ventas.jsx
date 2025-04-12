import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  Container,
  Stack, 
  Divider
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DataTable from "../components/DataTable";
import GraficoVentas from "./GraficoVentas";

// Datos de ejemplo 
const VENTAS_MOCK = [
  { id: 1, fecha: '2025-04-01', monto: 1500, nombreTrabajador: 'Juan Pérez', metodoPago: 'Efectivo' },
  { id: 2, fecha: '2025-04-01', monto: 2200, nombreTrabajador: 'María García', metodoPago: 'Tarjeta' },
  { id: 3, fecha: '2025-04-02', monto: 3400, nombreTrabajador: 'Juan Pérez', metodoPago: 'Transferencia' },
  { id: 4, fecha: '2025-04-03', monto: 1800, nombreTrabajador: 'Carlos López', metodoPago: 'Efectivo' },
  { id: 5, fecha: '2025-04-05', monto: 2700, nombreTrabajador: 'María García', metodoPago: 'Tarjeta' },
];

const Ventas = () => {
  const [ventas, setVentas] = useState(VENTAS_MOCK);
  const [filteredVentas, setFilteredVentas] = useState(VENTAS_MOCK);
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const [periodoGrafico, setPeriodoGrafico] = useState('mensual');
  const [isLoading, setIsLoading] = useState(false);

  // Función de ayuda para formatear de manera segura
  const formatMonto = (value) => {
    if (value === undefined || value === null) {
      return '$0';
    }
    return `$${value.toLocaleString('es-CL')}`;
  };

  // Definición de columnas para el DataTable
  const columns = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      size: 150,
    },
    {
      accessorKey: 'monto',
      header: 'Monto bruto',
      size: 150,
      Cell: ({ cell }) => formatMonto(cell.getValue()),
    },
    {
      accessorKey: 'nombreTrabajador',
      header: 'Monto Neto',
      size: 200,
    },
    {
      accessorKey: 'metodoPago',
      header: 'Método de Pago',
      size: 150,
    },
  ];

  // Filtrar ventas por fecha cuando cambia fechaBusqueda
  useEffect(() => {
    if (fechaBusqueda) {
      setIsLoading(true);
      const ventasFiltradas = ventas.filter(venta => venta.fecha === fechaBusqueda);
      setFilteredVentas(ventasFiltradas);
      setIsLoading(false);
    } else {
      setFilteredVentas(ventas);
    }
  }, [fechaBusqueda, ventas]);

  // Función para limpiar el filtro de fecha
  const handleLimpiarFiltro = () => {
    setFechaBusqueda('');
    setFilteredVentas(ventas);
  };

  // Función para descargar el reporte 
  const handleDescargarReporte = () => {
    console.log('Descargando reporte de ventas...');
    alert('Reporte descargado con éxito');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom component="div">
        Ventas
      </Typography>
      <Divider/>
      {/* Buscador por fecha */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Buscador de ventas por fecha
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Fecha"
            type="date"
            value={fechaBusqueda}
            onChange={(e) => setFechaBusqueda(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: 200 }}
          />
          <Button 
            variant="outlined" 
            onClick={handleLimpiarFiltro}
          >
            Limpiar filtro
          </Button>
        </Box>
      </Paper>
      <Divider/>
      {/* Tabla de ventas */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Listado de ventas
        </Typography>
        <Box sx={{ width: '100%' }}>
          <DataTable 
            data={filteredVentas} 
            columns={columns}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
      <Divider/>
      {/* Gráfico de ventas */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Gráfico de Ventas
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="periodo-grafico-label">Periodo</InputLabel>
            <Select
              labelId="periodo-grafico-label"
              id="periodo-grafico"
              value={periodoGrafico}
              label="Periodo"
              onChange={(e) => setPeriodoGrafico(e.target.value)}
            >
              <MenuItem value="anual">ANUAL</MenuItem>
              <MenuItem value="mensual">MENSUAL</MenuItem>
              <MenuItem value="semanal">SEMANAL</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Box sx={{ height: 300, width: '100%' }}>
          <GraficoVentas periodo={periodoGrafico} ventas={ventas} />
        </Box>
      </Paper>
      <Divider/>
      {/* Botón para descargar reporte */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<FileDownloadIcon />}
          onClick={handleDescargarReporte}
          size="large"
        >
          Descargar reporte
        </Button>
      </Box>
    </Stack>
  );
};

export default Ventas;