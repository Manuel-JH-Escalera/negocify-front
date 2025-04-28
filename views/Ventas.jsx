import React, { useState, useEffect, useMemo } from "react";
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
  Alert,
  Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import GraficoVentas from "./GraficoVentas";
import useVentas from "../hooks/ventas/useVentas";
import useDownloadReporte from "../hooks/ventas/useDownloadReporte";
import useVentasAnalisis from "../hooks/ventas/useVentasAnalisis";
import useUserStore from "../stores/userStore";
import useRangoFecha from "../hooks/ventas/useRangoFecha";
import useValorDolar from "../hooks/ventas/useValorDolar";
import { formatearFechaChilena, formatearFechaGMT4, obtenerFechaActualGMT4 } from "../utils/dateUtils";
import { formatearPesoChileno } from "../utils/commonUtils";

const Ventas = () => {
  const { selectedAlmacen } = useUserStore();
  const { almacenId: urlAlmacenId } = useParams();
  const almacenId = urlAlmacenId || selectedAlmacen?.id;

  const { periodo: periodoGrafico, setPeriodo: setPeriodoGrafico, calcularRangoFechas, descripcionPeriodo } = useRangoFecha();

  const {
    ventas,
    ventasOriginal,
    isLoading,
    isError,
    error,
    fechaFiltro,
    setFechaFiltro,
    refetch,
  } = useVentas(almacenId);

  const { data: dolarData, isLoading: isLoadingDolar, isError: isErrorDolar } = useValorDolar();

  const ventasConDolar = useMemo(() => {
    if (!dolarData || !ventas || ventas.length === 0) {
      return ventas;
    }

    // Obtener el valor del dólar
    const valorDolar = dolarData.valor;

    // Mapear las ventas para agregar el monto en dólares
    return ventas.map(venta => {
      // Obtener el monto_neto y verificar si es válido
      const montoNeto = parseFloat(venta.monto_neto);

      // Calcular el monto en dólares (si montoNeto es 0 o no es un número válido, devolver 0)
      const montoNetoDolar = isNaN(montoNeto) || montoNeto === 0 ? 
        0 : 
        parseFloat((montoNeto / valorDolar).toFixed(2));

      // Devolver la venta con el nuevo campo
      return {
        ...venta,
        monto_neto_dolar: montoNetoDolar
      };
    });
  }, [ventas, dolarData]);

  const { downloadReporte, isDownloading } = useDownloadReporte();

  const { obtenerDatosGrafico, estadisticas, distribucionMetodosPago } =
    useVentasAnalisis(ventasOriginal);

  // Función para limpiar el filtro de fecha
  const handleLimpiarFiltro = () => {
    setFechaFiltro(null);
  };

  // Función para descargar el reporte
  const handleDescargarReporte = () => {
    if (!almacenId) {
      toast.error("No se ha seleccionado un almacén");
      return;
    }

    // Calcular fechaInicio y fechaFin según el periodo seleccionado
    const { fechaInicio, fechaFin } = calcularRangoFechas(periodoGrafico);

    // Nombre descriptivo del periodo para el mensaje de éxito
    const nombrePeriodo = (() => {
      switch(periodoGrafico) {
        case 'anual': return 'anual';
        case 'mensual': return 'mensual';
        case 'semanal': return 'semanal';
        case 'ultimosSieteDias': return 'de los últimos 7 días';
        default: return periodoGrafico;
      }
    })();

    downloadReporte(
      { 
        almacenId: almacenId, 
        fechaInicio: fechaInicio,
        fechaFin: fechaFin 
      },
      {
        onSuccess: () => {
          toast.success(`Reporte ${nombrePeriodo} descargado correctamente`);
        },
        onError: (error) => {
          toast.error(`Error al descargar reporte: ${error.message}`);
        },
      }
    );
  };

  // Mapeo de IDs a nombres de métodos de pago
  const metodoPagoMap = {
    1: "Efectivo",
    2: "Tarjeta",
    3: "Transferencia",
  };

  // Función de ayuda para formatear de manera segura
  const formatMonto = (value) => {
    if (value === undefined || value === null) {
      return "$0";
    }
    return `$${value.toLocaleString("es-CL")}`;
  }; 

  // Definición de columnas para el DataTable
  const columns = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (!value) return "";
        return formatearFechaChilena(value);
      },
    },
    {
      accessorKey: "monto_bruto",
      header: "Monto bruto",
      size: 150,
      Cell: ({ cell }) => formatearPesoChileno(parseInt(cell.getValue())),
    },
    {
      accessorKey: "monto_neto",
      header: "Monto Neto",
      size: 150,
      Cell: ({ cell }) => formatearPesoChileno(parseInt(cell.getValue())),
    },
    {
      accessorKey: "monto_neto_dolar",
      header: "Monto Neto USD",
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (value === undefined || value === null || value === 0) {
          return "$0";
        }
        return `$${parseFloat(value).toFixed(2)}`;
      },
    },
    {
      accessorKey: "tipo_venta_id",
      header: "Método de Pago",
      size: 150,
      Cell: ({ cell }) => {
        const id = cell.getValue();
        return metodoPagoMap[id] || `Desconocido (${id})`;
      },
    },
  ];

  // Limitamos la fecha máxima al día actual en GMT-4
  const fechaActual = formatearFechaGMT4(obtenerFechaActualGMT4());

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom component="div">
        Ventas
      </Typography>
      <Divider />
      {/* Buscador por fecha */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Buscador de ventas por fecha
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Fecha"
            type="date"
            value={fechaFiltro || ""}
            onChange={(e) => {
              const fechaSeleccionada = e.target.value;
              setFechaFiltro(fechaSeleccionada);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: fechaActual
            }}
            sx={{ minWidth: 200 }}
          />
          <Button variant="outlined" onClick={handleLimpiarFiltro}>
            Limpiar filtro
          </Button>
        </Box>
      </Paper>
      <Divider />
      {/* Tabla de ventas */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Listado de ventas
        </Typography>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar ventas: {error?.message || "Error desconocido"}
          </Alert>
        )}
        <Box sx={{ width: "100%" }}>
          {ventas.length === 0 && fechaFiltro && !isLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No se encontraron ventas para la fecha {fechaFiltro}.
              {ventasOriginal.length > 0
                ? " Hay datos disponibles para otras fechas."
                : " No hay datos de ventas disponibles."}
            </Alert>
          )}
          <DataTable data={ventasConDolar} columns={columns} isLoading={isLoading || isLoadingDolar} />
        </Box>
      </Paper>
      <Divider />
      {/* Gráfico de ventas */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Gráfico de Ventas</Typography>
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
              <MenuItem value="ultimosSieteDias">SEMANAL</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Box sx={{ height: 300, width: "100%" }}>
          <GraficoVentas
            periodo={periodoGrafico}
            datos={obtenerDatosGrafico(periodoGrafico)}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
      <Divider />
      {/* Botón para descargar reporte */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Descargar Reporte</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            El reporte descargado contendrá solamente las ventas del periodo actual seleccionado ({descripcionPeriodo})
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", flex: 1, mt: 2, mb: 1 }}>
            <Tooltip title={`Descargar reporte de ventas para el periodo: ${descripcionPeriodo}`}>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                endIcon={<FilterAltIcon />}
                onClick={handleDescargarReporte}
                size="large"
                disabled={isLoading || isDownloading || ventasOriginal?.length === 0}
              >
                {isDownloading ? "Descargando..." : `Descargar reporte ${periodoGrafico.toUpperCase()}`}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      <Toaster position="top-center" />
    </Stack>
  );
}

export default Ventas;
