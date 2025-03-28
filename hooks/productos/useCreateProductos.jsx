import { useMutation, useQueryClient } from "@tanstack/react-query";

function useCreateProducto(options = {}) {
  const queryClient = useQueryClient();

  const createProducto = async (productoData) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/productos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
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
