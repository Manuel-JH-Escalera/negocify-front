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
  Stack, 
  Divider,
  Chip,
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import DataTable from "../components/DataTable";
import GraficoVentas from "./GraficoVentas";
import useVentas from "../hooks/ventas/useVentas";
import useDownloadReporte from "../hooks/ventas/useDownloadReporte";
import useVentasAnalisis from "../hooks/ventas/useVentasAnalisis";


const Ventas = () => {
  const { almacenId } = useParams();

  // Estado para el periodo del gráfico
  const [periodoGrafico, setPeriodoGrafico] = useState('mensual');

  const { 
    ventas, 
    ventasOriginal, 
    isLoading, 
    isError, 
    error,
    fechaFiltro,
    setFechaFiltro,
    refetch
  } = useVentas(almacenId);

  const { downloadReporte, isDownloading } = useDownloadReporte();

  const { 
    obtenerDatosGrafico,
    estadisticas,
    distribucionMetodosPago
  } = useVentasAnalisis(ventasOriginal);

  // Función para limpiar el filtro de fecha
  const handleLimpiarFiltro = () => {
    setFechaFiltro(null);
  };

  // Función para descargar el reporte
  const handleDescargarReporte = () => {
    downloadReporte(
      { almacenId },
      {
        onSuccess: () => {
          toast.success('Reporte descargado correctamente');
        },
        onError: (error) => {
          toast.error(`Error al descargar reporte: ${error.message}`);
        }
      }
    );
  };

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
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-CL');
      },
    },
    {
      accessorKey: 'monto_bruto',
      header: 'Monto bruto',
      size: 150,
      Cell: ({ cell }) => formatMonto(cell.getValue()),
    },
    {
      accessorKey: 'monto_neto',
      header: 'Monto Neto',
      size: 150,
      Cell: ({ cell }) => formatMonto(cell.getValue()),
    },
    {
      accessorKey: 'metodoPago',
      header: 'Método de Pago',
      size: 150,
    },
  ];  

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
            value={fechaFiltro || ''}
            onChange={(e) => setFechaFiltro(e.target.value)}
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
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar ventas: {error?.message || 'Error desconocido'}
          </Alert>
        )}
        <Box sx={{ width: '100%' }}>
          <DataTable 
            data={ventas} 
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
          <GraficoVentas 
            periodo={periodoGrafico} 
            datos={obtenerDatosGrafico(periodoGrafico)}
            isLoading={isLoading} 
          />
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
          disabled={isLoading || isDownloading || ventasOriginal?.length === 0}
        >
          {isDownloading ? 'Descargando...' : 'Descargar reporte'}
        </Button>
      </Box>
      <Toaster position="bottom-right" />
    </Stack>
  );
};

export default Ventas;