import { Alert, AlertTitle, Box, Paper } from "@mui/material";
import { Link } from "react-router";
import useUserStore from "../stores/userStore";

function NotFound() {
  const { userToken } = useUserStore();

  const redirectRoute = userToken ? "/dashboard/inicio" : "/";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={2}>
        <Alert severity="warning">
          <AlertTitle>404 - Página no encontrada</AlertTitle>
          La ruta que intentaste visitar no existe.
          <Link to={redirectRoute}>Volver al inicio</Link>
        </Alert>
      </Paper>
    </Box>
  );
}
export default NotFound;
