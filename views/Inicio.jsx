import { Typography, Stack } from "@mui/material";
import useUserStore from "../stores/userStore";

function Inicio() {
  const { userData } = useUserStore();

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Inicio</Typography>
      <Typography variant="h6">Bienvenido {userData?.nombre}</Typography>
    </Stack>
  );
}

export default Inicio;
