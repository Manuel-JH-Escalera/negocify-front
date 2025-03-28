import { 
  Typography, Button, TableContainer, Stack, Paper, Table, 
  TableHead, TableBody, TableRow, TableCell, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle
} from "@mui/material";
import { useState, useEffect } from "react";

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ nombre: "", tipo_producto_id: "", stock: 0, stock_minimo: 0, almacen_id: "" });
  const [categorias, setCategorias] = useState([]);

  // Obtener productos, categorías y almacenes al cargar la página
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/productos");
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      console.log("Productos recibidos:", data); 
      setProductos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/productos/tipo_producto");
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Abrir formulario para crear o editar producto
  const handleOpenDialog = (producto = null) => {
    setEditingProduct(producto);
    setNewProduct({
      nombre: producto ? producto.nombre : "",
      tipo_producto_id: producto ? producto.tipo_producto_id : "",
      stock: producto ? producto.stock : 0,
      stock_minimo: producto ? producto.stock_minimo : 0,
    });
    setOpenDialog(true);
  };
  

  // Cerrar formulario
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Guardar o actualizar producto
  const handleSaveProduct = async () => {
    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `http://localhost:3000/api/productos/${editingProduct.id}`
        : "http://localhost:3000/api/productos";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newProduct.nombre,
          tipo_producto_id: newProduct.tipo_producto_id,
          stock: newProduct.stock,
          stock_minimo: newProduct.stock_minimo,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar producto");

      fetchProductos();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar producto");

      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Inventario</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
        Agregar Producto
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Stock Mínimo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.tipoProducto?.nombre || "Desconocido"}</TableCell>
                <TableCell>{producto.stock}</TableCell>
                <TableCell>{producto.stock_minimo}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpenDialog(producto)}>
                    Editar
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDeleteProduct(producto.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario para crear o editar productos */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Nombre" name="nombre" value={newProduct.nombre} onChange={handleInputChange} />
          
          <TextField
            select
            label="Categoría"
            name="tipo_producto_id"
            value={newProduct.tipo_producto_id}
            onChange={handleInputChange}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </TextField>

          <TextField fullWidth margin="dense" label="Stock" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} />
          <TextField fullWidth margin="dense" label="Stock Mínimo" name="stock_minimo" type="number" value={newProduct.stock_minimo} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveProduct} color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
