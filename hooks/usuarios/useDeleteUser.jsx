import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";


function useDeleteUser(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const deleteUser = async (id) => {
    
    const params = new URLSearchParams();
    if (selectedAlmacen?.id) {
      params.append("almacen_id", selectedAlmacen?.id);
    }
    if (id) {
      params.append("user_id", id);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/users${queryString}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar usuario");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", selectedAlmacen?.id] });
    },
    ...options,
  });
}

export default useDeleteUser;
