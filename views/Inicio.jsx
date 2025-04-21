import {
  Typography,
  Grid,
  Card,
  CardContent,
  Badge,
  Stack,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid2,
} from "@mui/material";
import { useEffect, useState } from "react";
import useUserStore from "../stores/userStore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function Inicio() {
  const { userData, selectedAlmacen, userToken } = useUserStore();
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [avisosStock, setAvisosStock] = useState([]);
  const [graficoDatos, setGraficoDatos] = useState(null);

  useEffect(() => {
    if (!userToken || !selectedAlmacen?.id) {
      console.log("No se puede hacer la solicitud, falta login o almacén.");
      return;
    }

    const fetchDatos = async () => {
      try {
        const stockRes = await fetch(
          `${
            import.meta.env.VITE_BACK_URL
          }api/productos/bajo-stock?almacen_id=${selectedAlmacen.id}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        setAvisosStock(await stockRes.json());

        const ventasRes = await fetch(
          `${import.meta.env.VITE_BACK_URL}api/ventas/recientes?almacen_id=${
            selectedAlmacen.id
          }`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        setVentasRecientes(await ventasRes.json());

        // Si usas datos para un gráfico más adelante
        // const graficoRes = await fetch(...);
        // setGraficoDatos(await graficoRes.json());
      } catch (err) {
        console.error("Error cargando datos del inicio", err);
      }
    };

    fetchDatos();
  }, [selectedAlmacen, userToken]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Bienvenido, {userData?.nombre}</Typography>

      <Grid2 container spacing={2}>
        {/* Ventas Recientes */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Ventas Recientes</Typography>
              </Box>
              <List dense>
                {ventasRecientes?.length ? (
                  ventasRecientes.map((venta) => (
                    <ListItem key={venta.id}>
                      <ListItemText
                        primary={venta.producto}
                        secondary={`Monto: $${venta.total} - ${venta.fecha}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">Sin ventas recientes</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid2>

        {/* Avisos de Stock */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Badge badgeContent={avisosStock?.length || 0} color="error">
                    <WarningAmberIcon sx={{ color: "#FFBF00" }} />
                  </Badge>
                  <Typography variant="h6">Avisos de Stock</Typography>
                </Stack>
              </Box>
              <List dense>
                {avisosStock?.length ? (
                  avisosStock.map((prod) => (
                    <ListItem key={prod.id}>
                      <ListItemText
                        primary={prod.nombre}
                        secondary={`Stock actual: ${prod.stock}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">Todo está en orden ✅</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid2>

        {/* Gráfico de Ventas */}
        <Grid2 size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Gráfico de Ventas</Typography>
              </Box>
              {/* Si luego usas alguna librería como Chart.js, este canvas servirá */}
              <Box>
                <canvas id="graficoVentas"></canvas>
              </Box>
              {/* Si no tienes datos aún, podrías mostrar un loader o mensaje */}
              {!graficoDatos && (
                <Box mt={2}>
                  <Typography variant="body2">Próximamente...</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
