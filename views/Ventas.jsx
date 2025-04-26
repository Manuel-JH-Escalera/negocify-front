import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import GraficoVentas from "./GraficoVentas";
import useVentas from "../hooks/ventas/useVentas";
import useDownloadReporte from "../hooks/ventas/useDownloadReporte";
import useVentasAnalisis from "../hooks/ventas/useVentasAnalisis";
import useUserStore from "../stores/userStore";
import { formatearPesoChileno } from "../utils/commonUtils";

const Ventas = () => {
  const { selectedAlmacen } = useUserStore();
  const { almacenId: urlAlmacenId } = useParams();
  const almacenId = urlAlmacenId || selectedAlmacen?.id;

  // Estado para el periodo del gráfico
  const [periodoGrafico, setPeriodoGrafico] = useState("mensual");

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

  console.log("ID de almacén utilizado:", almacenId);

  useEffect(() => {
    console.log("Ventas filtradas:", ventas.length);
    console.log("Fecha filtro actual:", fechaFiltro);

    if (ventas.length === 0 && fechaFiltro) {
      console.log("ALERTA: No hay ventas para la fecha", fechaFiltro);

      // Verificar que hay datos originales
      console.log("Ventas originales disponibles:", ventasOriginal.length);

      // Mostrar las fechas disponibles para ayudar a depurar
      const fechasDisponibles = ventasOriginal
        .map((v) =>
          v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : null
        )
        .filter(Boolean);

      console.log("Fechas disponibles en los datos:", [
        ...new Set(fechasDisponibles),
      ]);
    }
  }, [ventas, fechaFiltro, ventasOriginal]);

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

    console.log("Descargando reporte para almacenId:", almacenId);

    downloadReporte(
      { almacenId: almacenId },
      {
        onSuccess: () => {
          toast.success("Reporte descargado correctamente");
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
        return new Date(value).toLocaleDateString("es-CL");
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
      accessorKey: "tipo_venta_id",
      header: "Método de Pago",
      size: 150,
      Cell: ({ cell }) => {
        const id = cell.getValue();
        return metodoPagoMap[id] || `Desconocido (${id})`;
      },
    },
  ];

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
              console.log("Fecha seleccionada:", fechaSeleccionada);
              setFechaFiltro(fechaSeleccionada);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: 200 }}
          />
          <Button variant="outlined" onClick={handleLimpiarFiltro}>
            Limpiar filtro
          </Button>
          {/* AÑADIDO ESTE BOTÓN PARA DEBUGGING */}
          {/* <Button 
            variant="outlined" 
            color="warning"
            onClick={() => {
              console.log("=== DEBUG: Todas las ventas disponibles ===");
              console.log("Total ventas sin filtrar:", ventasOriginal.length);
              
              if (ventasOriginal.length > 0) {
                console.log("Ejemplo de venta:", ventasOriginal[0]);
                
                // Mostrar todas las fechas disponibles
                const fechasDisponibles = ventasOriginal
                  .map(v => v.fecha ? new Date(v.fecha).toISOString().split('T')[0] : null)
                  .filter(Boolean);
                
                console.log("Fechas disponibles:", [...new Set(fechasDisponibles)]);
                
                // Temporalmente mostrar todas las ventas
                toast.success(`Mostrando ${ventasOriginal.length} ventas sin filtrar (solo para debug)`);
              } else {
                console.log("No hay ventas disponibles");
                toast.error("No hay ventas disponibles para mostrar");
              }
            }}
          >
            Ver Datos (Debug)
          </Button> */}
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              console.log(
                `Forzando recarga de ventas para almacén ${almacenId}`
              );
              // Limpiar filtro de fecha
              setFechaFiltro(null);
              // Forzar recarga
              refetch();
            }}
          >
            Recargar datos
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
          <DataTable data={ventas} columns={columns} isLoading={isLoading} />
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
              <MenuItem value="semanal">SEMANAL</MenuItem>
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
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleDescargarReporte}
          size="large"
          disabled={isLoading || isDownloading || ventasOriginal?.length === 0}
        >
          {isDownloading ? "Descargando..." : "Descargar reporte"}
        </Button>
      </Box>
      <Toaster position="top-center" />
    </Stack>
  );
};

export default Ventas;
