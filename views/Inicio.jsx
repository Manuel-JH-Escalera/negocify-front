import { useEffect, useState, useMemo } from "react";
import useUserStore from "../stores/userStore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import useVentas from "../hooks/ventas/useVentas";
import GraficoVentas from "./GraficoVentas";
import useVentasAnalisis from "../hooks/ventas/useVentasAnalisis";
import {
  CircularProgress,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Badge,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function Inicio() {
  const { userData, selectedAlmacen, userToken } = useUserStore();
  const { ventasOriginal, isLoading, error } = useVentas(selectedAlmacen?.id);

  const [avisosStock, setAvisosStock] = useState([]);
  const [periodoGrafico, setPeriodoGrafico] = useState("semanal");
  const theme = useTheme();

  // Calcular ventas recientes solo si hay ventas disponibles
  const ventasRecientes = useMemo(() => {
    if (!Array.isArray(ventasOriginal) || ventasOriginal.length === 0)
      return [];
    return [...ventasOriginal]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);
  }, [ventasOriginal]);

  // Datos para el gráfico de ventas
  const datosGrafico = useMemo(() => {
    return ventasRecientes.map((venta) => ({
      fecha: new Date(venta.fecha).toLocaleDateString(),
      monto: venta.monto_bruto,
    }));
  }, [ventasRecientes]);

  // Calcular el valor máximo del gráfico (para el eje Y)
  const maxY = useMemo(() => {
    const maxVenta = Math.max(...ventasRecientes.map((venta) => venta.monto));
    return maxVenta + 1000; // Se ajusta el máximo para que no esté pegado al borde
  }, [ventasRecientes]);

  const { obtenerDatosGrafico, estadisticas, distribucionMetodosPago } =
    useVentasAnalisis(ventasOriginal);

  useEffect(() => {
    if (!userToken || !selectedAlmacen?.id) {
      console.log("No se puede hacer la solicitud, falta login o almacén.");
      return;
    }

    const fetchAvisosStock = async () => {
      try {
        const stockRes = await fetch(
          `${
            import.meta.env.VITE_BACK_URL
          }api/productos/bajo-stock?almacen_id=${selectedAlmacen.id}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        const stockData = await stockRes.json();
        setAvisosStock(stockData);
      } catch (err) {
        console.error("Error cargando avisos de stock", err);
      }
    };

    fetchAvisosStock();
  }, [selectedAlmacen, userToken]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Bienvenido, {userData?.nombre}</Typography>

      <Box display="flex" flexDirection={{ sd: "column", md: "row" }} gap={2}>
        {/* Ventas Recientes */}
        <Card sx={{ flex: 1, maxHeight: 250 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              display="flex"
              flexDirection="column"
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <Box display="flex" alignItems="center" mb={0.2}>
                <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Ventas Recientes</Typography>
              </Box>
              <Divider sx={{ mt: 0.5, mb: 0.5 }} />
            </Box>

            {/* Box para la lista de ventas, con scroll */}
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              <List dense>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={1}>
                    <CircularProgress size={20} />
                  </Box>
                ) : ventasRecientes?.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No hay ventas recientes disponibles" />
                  </ListItem>
                ) : (
                  ventasRecientes.map((venta, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`Venta: $${venta.monto_bruto}`}
                        secondary={`Fecha: ${new Date(
                          venta.fecha
                        ).toLocaleDateString("es-CL")}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </CardContent>
        </Card>

        {/* Avisos de Stock */}
        <Card sx={{ flex: 1, maxHeight: 250 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Box para el título */}
            <Box
              display="flex"
              flexDirection="column"
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <Box display="flex" alignItems="center" mb={0.2}>
                <Badge badgeContent={avisosStock?.length || 0} color="error">
                  <WarningAmberIcon
                    sx={{
                      color:
                        avisosStock?.length >= 6
                          ? "red"
                          : avisosStock?.length >= 1
                          ? "#FFBF00"
                          : theme.palette.primary.main,
                      mr: 1,
                    }}
                  />
                </Badge>
                <Typography variant="h6">Avisos de Stock</Typography>
              </Box>
              <Divider sx={{ mt: 0.5, mb: 0.5 }} />
            </Box>

            {/* Box para la lista de avisos de stock, con scroll */}
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              <List dense>
                {avisosStock?.length ? (
                  avisosStock.map((prod, index) => (
                    <ListItem key={prod.id || index}>
                      <ListItemText primary={`Producto: ${prod.nombre}`} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Todo está en orden ✅" />
                  </ListItem>
                )}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Gráfico de Ventas */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <StackedLineChartIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Gráfico de Ventas</Typography>
            <FormControl sx={{ minWidth: 150, ml: 1, mt: 1, height: "auto" }}>
              <InputLabel id="periodo-grafico-label">Periodo</InputLabel>
              <Select
                labelId="periodo-grafico-label"
                id="periodo-grafico"
                value={periodoGrafico}
                label="Periodo"
                onChange={(e) => setPeriodoGrafico(e.target.value)}
                sx={{ height: 36 }}
              >
                <MenuItem value="anual">Anual</MenuItem>
                <MenuItem value="mensual">Mensual</MenuItem>
                <MenuItem value="semanal">Semanal</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mt: 2 }} />
          <Box mt={2} sx={{ height: 300 }}>
            <GraficoVentas
              periodo={periodoGrafico}
              datos={obtenerDatosGrafico(periodoGrafico)}
              isLoading={isLoading}
            />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
