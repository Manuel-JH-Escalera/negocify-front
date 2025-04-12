import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useUpdateProducto(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const updateProducto = async ({ id, productoData }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/productos/${id}`,
      {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
      },
        body: JSON.stringify({
          ...productoData,
          almacen_id: selectedAlmacen?.id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el producto");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    ...options,
  });
}

export default useUpdateProducto;
