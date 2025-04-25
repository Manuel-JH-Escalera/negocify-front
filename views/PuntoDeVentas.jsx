import {
  Typography,
  Stack,
  Divider,
  Button,
  Tooltip,
  Grid2,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import useProductos from "../hooks/useProductos";
import { useMemo, useState, useCallback, useEffect } from "react";
import DataTable from "../components/DataTable";
import useTipoProductos from "../hooks/tipoProducto/useTipoProducto";
import { formatearPesoChileno } from "../utils/commonUtils";
import { AddShoppingCart, RemoveShoppingCart } from "@mui/icons-material";
import useTipoVenta from "../hooks/ventas/useTipoVenta";
import useCreateVenta from "../hooks/ventas/useCreateVenta";
import { useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

export default function PuntoDeVentas() {
  const queryClient = useQueryClient();
  const [carrito, setCarrito] = useState([]);
  const [selectedTipoPago, setSelectedTipoPago] = useState();
  const [searchObject, setSearchObject] = useState({
    search_name: null,
    search_sku: null,
    tipo_producto_id: "",
  });
  const { data: productos, isLoading, isFetching } = useProductos(searchObject);
  const { data: tipoProducto } = useTipoProductos();
  const { data: tiposVenta } = useTipoVenta();
  const [totalVenta, setTotalVenta] = useState();

  const { mutate: createVentaMutation, isPending: isPendingVentaMutation } =
    useCreateVenta({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["productos"] });
        toast.success(`Venta finalizada exitosamente`);
        setCarrito([]);
        setSelectedTipoPago();
      },
      onError: (error) => {
        toast.error(`Error al crear al finalizar la venta: ${error.message}`);
      },
    });

  const handleFinalizarVenta = () => {
    const productosVenta = carrito?.map((producto) => {
      return {
        producto_id: producto.id,
        cantidad: producto.cantidad,
      };
    });
    const ventaData = {
      monto_bruto: totalVenta,
      tipo_venta_id: selectedTipoPago,
      productos: productosVenta,
    };
    createVentaMutation(ventaData);
  };

  const handleTipoProductoChange = (event) => {
    setSearchObject((prev) => ({
      ...prev,
      tipo_producto_id: event.target.value === "" ? null : event.target.value,
    }));
  };

  const handleCarritoAdd = useCallback((producto) => {
    const productoIdAsNumber = parseInt(producto.id, 10);
    if (isNaN(productoIdAsNumber)) {
      console.error("El ID del producto no es un número válido:", producto.id);
      return;
    }

    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find(
        (p) => p.id === productoIdAsNumber
      );
      if (productoExistente) {
        return prevCarrito.map((item) =>
          item.id === productoIdAsNumber
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        const nuevoProducto = {
          ...producto,
          id: productoIdAsNumber,
          cantidad: 1,
        };
        return [...prevCarrito, nuevoProducto];
      }
    });
  }, []);

  const handleCarritoRemove = useCallback((producto) => {
    const productoIdAsNumber = parseInt(producto.id, 10);
    if (isNaN(productoIdAsNumber)) {
      console.error("El ID del producto a remover no es válido:", producto.id);
      return;
    }

    setCarrito((prevCarrito) => {
      const itemIndex = prevCarrito.findIndex(
        (item) => item.id === productoIdAsNumber
      );

      if (itemIndex === -1) {
        return prevCarrito;
      }

      const itemToDecrement = prevCarrito[itemIndex];

      if (itemToDecrement.cantidad > 1) {
        return prevCarrito.map((item, index) => {
          if (index === itemIndex) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        });
      } else {
        return prevCarrito.filter((item, index) => index !== itemIndex);
      }
    });
  }, []);

  const handleCarritoTotallyRemove = useCallback((producto) => {
    const productoIdAsNumber = parseInt(producto.id, 10);
    if (isNaN(productoIdAsNumber)) {
      console.error("El ID del producto a remover no es válido:", producto.id);
      return;
    }

    setCarrito((prevCarrito) => {
      const itemIndex = prevCarrito.findIndex(
        (item) => item.id === productoIdAsNumber
      );

      if (itemIndex === -1) {
        return prevCarrito;
      }

      return prevCarrito.filter((item, index) => index !== itemIndex);
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "Producto",
        accessorKey: "nombre",
      },
      {
        header: "Stock",
        accessorKey: "stock",
        size: 50,
      },
      {
        header: "Valor",
        accessorKey: "valor",
        size: 50,
        Cell: ({ row }) => formatearPesoChileno(row.original.valor),
      },
      {
        header: "Tipo de producto",
        accessorKey: "tipoProducto.nombre",
      },
      {
        header: "Acciones",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          const productoIdAsNumber = parseInt(row.original.id, 10);
          const itemIndex = carrito.findIndex(
            (item) => item.id === productoIdAsNumber
          );

          if (itemIndex === -1) {
            return (
              <Tooltip title="Añadir al carrito" placement="top" arrow>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleCarritoAdd(row.original)}
                  endIcon={<AddShoppingCart />}
                  sx={{ minWidth: 108 }}
                >
                  Añadir
                </Button>
              </Tooltip>
            );
          } else {
            return (
              <Tooltip title="Eliminar del carrito" placement="top" arrow>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  endIcon={<RemoveShoppingCart />}
                  onClick={() => handleCarritoTotallyRemove(row.original)}
                  sx={{ minWidth: 108 }}
                >
                  Eliminar
                </Button>
              </Tooltip>
            );
          }
        },
      },
    ],
    [carrito, handleCarritoAdd, handleCarritoTotallyRemove]
  );

  const columnsCarrito = useMemo(
    () => [
      {
        header: "Producto",
        accessorKey: "nombre",
      },
      {
        header: "Cantidad",
        accessorKey: "cantidad",
        size: 50,
      },
      {
        header: "Acciones",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={2}>
            <Tooltip title="Quitar" placement="top" arrow>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => handleCarritoRemove(row.original)}
              >
                -
              </Button>
            </Tooltip>
            <Tooltip title="Añadir" placement="top" arrow>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleCarritoAdd(row.original)}
              >
                +
              </Button>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [handleCarritoAdd, handleCarritoRemove]
  );

  useEffect(() => {
    const valorInicial = 0;
    const total = carrito.reduce(
      (accumulator, currentValue) =>
        accumulator + currentValue.valor * currentValue.cantidad,
      valorInicial
    );

    setTotalVenta(total);
  }, [carrito]);

  return (
    <Stack spacing={2}>
      <Toaster position="top-center" />
      <Typography variant="h6">Punto De Ventas</Typography>
      <Divider />
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Buscador
      </Typography>
      <Stack spacing={2} direction={"row"}>
        <TextField
          id="search-text"
          label="Nombre de producto"
          variant="outlined"
          helperText="Ingrese el nombre del producto"
          value={searchObject.search_name || ""}
          onChange={(e) =>
            setSearchObject((prev) => ({
              ...prev,
              search_name: e.target.value,
            }))
          }
        />
        <TextField
          id="search-sku"
          label="SKU de producto"
          variant="outlined"
          helperText="Ingrese el SKU del producto"
          value={searchObject.search_sku || ""}
          onChange={(e) =>
            setSearchObject((prev) => ({ ...prev, search_sku: e.target.value }))
          }
        />
        <TextField
          id="tipo_producto"
          label="Tipo de producto"
          helperText="Seleccione tipo de producto"
          value={searchObject.tipo_producto_id || ""}
          onChange={handleTipoProductoChange}
        >
          <MenuItem value="">Tipo de producto</MenuItem>
          {tipoProducto?.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Divider />
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Productos
          </Typography>
          <DataTable
            data={productos}
            columns={columns}
            isLoading={isLoading || isFetching}
            topToolbar={false}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Carrito de compra
          </Typography>
          <DataTable
            data={carrito}
            columns={columnsCarrito}
            isLoading={isLoading || isFetching}
            topToolbar={false}
            bottomToolbar={false}
          />
          {totalVenta ? (
            <Stack spacing={2} marginTop={2}>
              <Paper elevation={2} sx={{ mt: 2, p: 1 }}>
                Total de venta: <b>{formatearPesoChileno(totalVenta)}</b>
              </Paper>
              {tiposVenta.length && (
                <TextField
                  id="tipo_venta"
                  label="Tipo de venta"
                  helperText="Seleccione tipo de venta"
                  value={selectedTipoPago || ""}
                  onChange={(e) => setSelectedTipoPago(e.target.value)}
                >
                  <MenuItem value="">Tipo de venta</MenuItem>
                  {tiposVenta?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                variant="contained"
                color="success"
                onClick={() => handleFinalizarVenta()}
                disabled={!selectedTipoPago || isPendingVentaMutation}
              >
                finalizar venta
              </Button>
            </Stack>
          ) : null}
        </Grid2>
      </Grid2>
    </Stack>
  );
}
