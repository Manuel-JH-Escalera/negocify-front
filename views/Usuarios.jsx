import { Typography, Button, Stack, Divider } from "@mui/material";
import { useMemo } from "react";
import { useState } from "react";
// import useUsuarios from "../hooks/usuarios/useUsuarios";
import DataTable from "../components/DataTable";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

export default function Usuarios() {
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  // const { data: usuarios, isLoading } = useUsuarios({ searchName, searchRole });

  const mockUsuarios = [
    { nombre: "Juan Pérez", email: "juan@example.com", rol: "Administrador" },
    { nombre: "Ana Torres", email: "ana@example.com", rol: "Empleado" },
    { nombre: "Luis Gómez", email: "luis@example.com", rol: "Empleado" },
  ];

  const usuarios = mockUsuarios.filter((usuario) => {
    const matchesName = usuario.nombre
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesRole = searchRole ? usuario.rol === searchRole : true;
    return matchesName && matchesRole;
  });

  const roles = ["Administrador", "Empleado"];

  const columns = useMemo(
    () => [
      { header: "Nombre", accessorKey: "nombre" },
      { header: "Email", accessorKey: "email" },
      { header: "Rol", accessorKey: "rol" },
      {
        header: "Acciones",
        accessorKey: "acciones",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="primary">
              Editar
            </Button>
            <Button variant="contained" color="secondary">
              Eliminar
            </Button>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Gestión de Usuarios</Typography>
      <Divider />
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Filtro de Búsqueda
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Nombre"
          variant="outlined"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          helperText="Buscar por nombre"
        />

        <TextField
          label="Rol"
          variant="outlined"
          select
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          helperText="Filtrar por rol"
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: "auto" }}
          onClick={() => console.log("Agregar Usuario")}
        >
          Nuevo Usuario
        </Button>
      </Stack>
      <Divider />
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Lista de Usuarios
      </Typography>
      <DataTable
        columns={columns}
        data={usuarios}
        isLoading={false}
        pageSize={10}
        pagination
        enableSorting={true}
        enableFiltering={true}
      />
    </Stack>
  );
}
