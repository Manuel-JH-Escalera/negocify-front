import { useQuery } from "@tanstack/react-query";

function useTipoProductos() {
  const fetchProductos = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_URL}api/productos/tipo_producto`
      );
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err.message);
    }
  };
  return useQuery({
    queryKey: ["tipoProductos"],
    queryFn: fetchProductos,
  });
}

export default useTipoProductos;
