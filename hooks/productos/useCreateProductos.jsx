import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useCreateProducto(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const createProducto = async (productoData) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/productos`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json" },
        body: JSON.stringify({
          productoData, almacen_id: selectedAlmacen?.id,}),
      }
    );

    if (!response.ok) {
      throw new Error("Error al crear el producto");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    ...options,
  });
}

export default useCreateProducto;
