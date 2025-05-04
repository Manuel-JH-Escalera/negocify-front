import { useQuery } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useUsuarios(options = {}) {
  const { userToken, selectedAlmacen } = useUserStore();

  const fetchUsuarios = async () => {
    const params = new URLSearchParams();
    if (selectedAlmacen?.id) {
      params.append("almacen_id", selectedAlmacen?.id);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/users${queryString}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    return response.json();
  };

  return useQuery({
    queryKey: ["usuarios", selectedAlmacen?.id],
    queryFn: fetchUsuarios,
    enabled: !!selectedAlmacen?.id,
    ...options,
  });
}

export default useUsuarios;
