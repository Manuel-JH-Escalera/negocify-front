import {
  Typography,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Box,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import { useState, useMemo } from "react";
import useProductos from "../hooks/useProductos";
import useCreateProducto from "../hooks/productos/useCreateProductos";
import useDeleteProducto from "../hooks/productos/useDeleteProducto";
import useUpdateProducto from "../hooks/productos/useUpdateProductos";
import useTipoProductos from "../hooks/tipoProducto/useTipoProducto";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import DataTable from "../components/DataTable";
import useUserStore from "../stores/userStore";

export default function Inventario() {
  const queryClient = useQueryClient();
  const { selectedAlmacen } = useUserStore();
  const {
    data: productos,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
    error: productosError,
  } = useProductos();
  const createProductoMutation = useCreateProducto({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(`Producto creado exitosamente`);
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Error al crear el producto: ${error.message}`);
    },
  });

  const updateProductoMutation = useUpdateProducto({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(`Producto actualizado exitosamente`);
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Error al actualizar el producto: ${error.message}`);
    },
  });

  const deleteProductoMutation = useDeleteProducto({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(`Producto eliminado exitosamente`);
    },
    onError: (error) => {
      toast.error(`Error al eliminar el producto: ${error.message}`);
    },
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteProducto, setDeleteProducto] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    tipo_producto_id: "",
    stock: 0,
    stock_minimo: 0,
    almacen_id: "",
    sku: "",
    valor: 0,
  });
  const { data: categorias } = useTipoProductos();

  const columns = useMemo(
    () => [
      {
        header: "Producto",
        accessorKey: "nombre",
      },
      {
        header: "Stock",
        accessorKey: "stock",
      },
      {
        header: "Stock Mínimo",
        accessorKey: "stock_minimo",
      },
      {
        header: "SKU",
        accessorKey: "sku",
      },

      {
        header: "Valor",
        accessorKey: "valor",
        Cell: ({ cell }) => (
          <Typography>
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(cell.getValue())}
          </Typography>
        ),
      },
      {
        header: "Acciones",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleOpenDialog(row.original)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleOpenDeletedialog(row.original)}
            >
              Eliminar
            </Button>
          </>
        ),
      },
    ],
    []
  );

  // Manejo de apertura del diálogo de eliminación
  const handleOpenDeletedialog = (producto) => {
    setDeleteProducto(producto);
    setOpenDeleteDialog(true);
  };

  // Manejo de cierre del diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteProducto(null);
  };

  // Confirmación de eliminación del producto
  const handleDeleteProducto = () => {
    if (deleteProducto) {
      deleteProductoMutation.mutate(deleteProducto.id);
    }
    handleCloseDeleteDialog();
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e) => {
    setNewProduct({ ...newProduct, tipo_producto_id: e.target.value });
  };

  // Abrir formulario para crear o editar producto
  const handleOpenDialog = (producto = null) => {
    setEditingProduct(producto);
    setNewProduct({
      nombre: producto ? producto.nombre : "",
      tipo_producto_id: producto ? producto.tipo_producto_id : "",
      stock: producto ? producto.stock : 0,
      stock_minimo: producto ? producto.stock_minimo : 0,
      sku: producto ? producto.sku : "",
      valor: producto ? producto.valor : 0,
      almacen_id: producto ? producto.almacen_id : selectedAlmacen?.id,
    });
    setOpenDialog(true);
  };

  // Cerrar formulario
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Guardar o actualizar producto
  const handleSaveProduct = async () => {
    if (editingProduct) {
      updateProductoMutation.mutate({
        id: editingProduct.id,
        nombre: newProduct.nombre,
        tipo_producto_id: newProduct.tipo_producto_id,
        stock: newProduct.stock,
        stock_minimo: newProduct.stock_minimo,
        sku: newProduct.sku,
        valor: newProduct.valor,
      });
    } else if (!editingProduct) {
      createProductoMutation.mutate({
        nombre: newProduct.nombre,
        tipo_producto_id: newProduct.tipo_producto_id,
        stock: newProduct.stock,
        stock_minimo: newProduct.stock_minimo,
        almacen_id: selectedAlmacen?.id,
        sku: newProduct.sku, // Agregar SKU
        valor: newProduct.valor, // Agregar Valor
      });
    }
  };

  if (isLoadingProductos) {
    return <CircularProgress />;
  }

  if (isErrorProductos) {
    return <Alert severity={"error"}>{productosError}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Toaster position="top-center" />
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant="h6">Inventario</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Agregar Producto
        </Button>
      </Box>
      <Divider />
      <DataTable
        data={productos || []}
        columns={columns}
        isLoading={isLoadingProductos}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>
          {editingProduct ? "Editar Producto" : "Agregar Producto"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              fullWidth
              margin="dense"
              label="Nombre"
              name="nombre"
              value={newProduct.nombre}
              onChange={handleInputChange}
            />
            <Select
              labelId="Categoría"
              id="categoria"
              value={newProduct.tipo_producto_id}
              label="Categoría"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Selecciona una categoría</MenuItem>
              {categorias?.map((categoria) => (
                <MenuItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              margin="dense"
              label="Stock"
              name="stock"
              type="number"
              value={newProduct.stock}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Stock Mínimo"
              name="stock_minimo"
              type="number"
              value={newProduct.stock_minimo}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="SKU"
              name="sku"
              value={newProduct.sku}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Valor"
              name="valor"
              type="number"
              value={newProduct.valor}
              onChange={handleInputChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProduct}
            color="primary"
            loading={updateProductoMutation.isPending}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación para eliminar producto */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>¿Estás seguro de eliminar este producto?</DialogTitle>
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
            onClick={handleDeleteProducto}
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
