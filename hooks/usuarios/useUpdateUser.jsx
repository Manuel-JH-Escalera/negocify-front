import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useUpdateUser(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const updateUser = async (userDate)
  const { id, nombre, email, password, rol } = userData;

    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/usuarios/${id}`,
      {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
            nombre,
            email,
            password,
            rol,

          almacen_id: selectedAlmacen?.id,
        }),
      }
    );
  

    if (!response.ok) {
      throw new Error("Error al actualizar usuario");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", selectedAlmacen?.id] });
    },
    ...options,
  });
}

export default useUpdateUser;
