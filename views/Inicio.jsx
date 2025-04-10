import { Typography, Stack } from "@mui/material";
import useUserStore from "../stores/userStore";

function Inicio() {
  const { userData, userAlmacenes } = useUserStore();

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Inicio</Typography>
      <Typography variant="h6">Bienvenido {userData?.nombre}</Typography>
      {JSON.stringify(userData)}
      {JSON.stringify(userAlmacenes)}
    </Stack>
  );
}

export default Inicio;
