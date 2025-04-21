import { useQuery } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useTipoVenta() {
  const { selectedAlmacen, userToken } = useUserStore();

  const fetchTipoVentas = async () => {
    const url = `${import.meta.env.VITE_BACK_URL}api/tipos-venta`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        return { data: [] };
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err.message);
    }
  };

  return useQuery({
    queryKey: ["tipoVenta"],
    queryFn: fetchTipoVentas,
    enabled: !!userToken && !!selectedAlmacen?.id,
  });
}

export default useTipoVenta;
