import { Typography, Stack } from "@mui/material";
import useUserStore from "../stores/userStore";
import useProductos from "../hooks/useProductos";

function Inicio() {
  const { userData } = useUserStore();
  const { data: productos } = useProductos();

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Inicio</Typography>
      <Typography variant="h6">Bienvenido {userData?.nombre}</Typography>
      {productos?.map((producto) => {
        return <h1>{producto.nombre}</h1>;
      })}
    </Stack>
  );
}

export default Inicio;
