import { useMutation, useQueryClient } from "@tanstack/react-query";

function useDeleteProducto(options = {}) {
  const queryClient = useQueryClient();

  const deleteProducto = async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/productos/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar el producto");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    ...options,
  });
}

export default useDeleteProducto;
