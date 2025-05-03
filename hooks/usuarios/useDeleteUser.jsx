import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useDeleteUser(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const deleteUser = async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          almacen_id: selectedAlmacen?.id,
        }),
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
