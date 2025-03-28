import { useMutation, useQueryClient } from "@tanstack/react-query";

function useUpdateProducto(options = {}) {
  const queryClient = useQueryClient();

  const updateProducto = async ({ id, productoData }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/productos/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
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
