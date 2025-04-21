import { useMutation } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useCreateVenta(options = {}) {
  const { userToken, selectedAlmacen } = useUserStore();

  const createVenta = async (ventaData) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/ventas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...ventaData, almacen_id: selectedAlmacen?.id }),
    });

    if (!response.ok) {
      throw new Error("Error al crear la venta");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: createVenta,
    ...options,
  });
}

export default useCreateVenta;
