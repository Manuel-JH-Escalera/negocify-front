import {
  Typography,
  Button,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Modal,
  Box,
  CircularProgress,
  Alert,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import useUsuarios from "../hooks/usuarios/useUsuarios";
import useUserStore from "../stores/userStore";
import useCreateUser from "../hooks/usuarios/useCreateUser";
import useUpdateUser from "../hooks/usuarios/useUpdateUser";
import useDeleteUser from "../hooks/usuarios/useDeleteUser";
import DataTable from "../components/DataTable";
import { useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

export default function Usuarios() {
  const queryClient = useQueryClient();
  const { selectedAlmacen, userAlmacenes } = useUserStore();
  const {
    data: usuarios,
    isLoading: isLoadingUsuarios,
    isError: isErrorUsuarios,
    error: errorUsuarios,
  } = useUsuarios();
  const createUsuarioMutation = useCreateUser({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario creado con éxito");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Error al crear usuario: ${error.message}`);
    },
  });
  const updateUsuarioMutation = useUpdateUser({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario actualizado con éxito");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Error al actualizar usuario: ${error.message}`);
    },
  });
  const deleteUsuarioMutation = useDeleteUser({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario eliminado con éxito");
    },
    onError: (error) => {
      toast.error(`Error al eliminar usuario: ${error.message}`);
    },
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteUsuario, setDeleteUsuario] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    rol: "",
    almacen_id: selectedAlmacen?.id,
  });

  useEffect(() => {
    if (!editingUser) {
      const almacenDefault = selectedAlmacen?.id || userAlmacenes?.[0]?.id;
      if (almacenDefault) {
        setNewUser((prev) => ({
          ...prev,
          almacen_id: almacenDefault,
        }));
      }
    }
  }, [selectedAlmacen, userAlmacenes, editingUser]);

  const columns = useMemo(
    () => [
      { header: "Nombre", accessorKey: "nombre" },
      { header: "Apellido", accessorKey: "apellido" },
      { header: "Teléfono", accessorKey: "telefono" },
      { header: "Email", accessorKey: "email" },
      { 
        header: "Rol", 
        accessorKey: "rol", 
        Cell: ({ row }) => {
          const roles = row.original.Roles;
          return roles && roles.length > 0 ? roles[0].nombre : 'Sin rol';
        }
      },
      {
        header: "Acciones",
        accessorKey: "acciones",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleOpenDialog(row.original)}
              sx={{ mr: 1 }}
            >
              <DriveFileRenameOutlineIcon />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleOpenDeleteDialog(row.original)}
            >
              <DeleteIcon />
            </Button>
          </Stack>
        ),
      },
    ],
    []
  );

  const handleOpenDeleteDialog = (usuario) => {
    setDeleteUsuario(usuario);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteUsuario(null);
  };

  const handleDeleteUsuario = () => {
    if (deleteUsuario) {
      deleteUsuarioMutation.mutate(deleteUsuario.id);
    }
    handleCloseDeleteDialog();
  };

  const handleSelectChange = (e) => {
    setNewUser({ ...newUser, rol: e.target.value });
  };

  const handleOpenDialog = (usuario = null) => {
    console.log("Usuario a editar:", usuario);
    setEditingUser(usuario);
    setNewUser({
      nombre: usuario ? usuario.nombre : "",
      apellido: usuario ? usuario.apellido : "",
      telefono: usuario ? usuario.telefono : "",
      email: usuario ? usuario.email : "",
      password: "",
      rol: usuario ? usuario.rol : "",
      almacen_id: selectedAlmacen?.id

    });
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveUser = async () => {
    const isValidAlmacen = userAlmacenes?.some(
      (a) => a.id === newUser.almacen_id
    );
  
    if (!isValidAlmacen) {
      toast.error("No tienes permisos para este almacén.");
      return;
    }
  
    if (editingUser) {
      updateUsuarioMutation.mutate({
        id: editingUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        telefono: newUser.telefono,
        email: newUser.email,
        password: newUser.password,
        rol: newUser.rol,
        almacen_id: newUser.almacen_id,
      });
    } else {
      createUsuarioMutation.mutate({
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        telefono: newUser.telefono,
        email: newUser.email,
        password: newUser.password,
        rol: newUser.rol,
        almacen_id: newUser.almacen_id,
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (isLoadingUsuarios) {
    return <CircularProgress />;
  }

  if (isErrorUsuarios) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {errorUsuarios?.message || "Error al obtener los usuarios"}
        </Alert>
        <DataTable
          data={[]} // Mostramos la tabla vacía
          columns={columns}
          isLoading={false}
        />
      </Stack>
    );
  }

  // Verificar si los usuarios están disponibles y en el formato correcto
  // Verifica los datos antes de pasarlos a la tabla

  return (
    <Stack spacing={2}>
      <Toaster position="top-center" />
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant="h6">Usuarios</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Agregar Usuario
        </Button>
      </Box>
      <Divider />
      <DataTable
        data={usuarios.data || []}
        columns={columns}
        isLoading={isLoadingUsuarios}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>
          {editingUser ? "Editar Usuario" : "Agregar Usuario"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              fullWidth
              margin="dense"
              label="Nombre"
              name="nombre"
              value={newUser.nombre}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Apellido"
              name="apellido"
              value={newUser.apellido}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Teléfono"
              name="telefono"
              value={newUser.telefono}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Contraseña"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
            />
            <Select
              labelId="Rol"
              id="rol"
              value={newUser.rol || ""}
              onChange={handleSelectChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Seleccione un Rol </MenuItem>
              <MenuItem value="1">Administrador</MenuItem>
              <MenuItem value="2">Empleado</MenuItem>
            </Select>
            <Select
            labelId="Almacén"
            id="almacen"
            value={newUser.almacen_id}
            onChange={()=>console.log('se cambio el almacen')}
            
            fullWidth
            disabled={true}
          >
            {userAlmacenes?.map((almacen) => (
              <MenuItem key={almacen.id} value={almacen.id}>
                {almacen.nombre}
              </MenuItem>
            ))}
          </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación para eliminar usuario */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>¿Estás seguro de eliminar este usuario?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUsuario}
            color="primary"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
