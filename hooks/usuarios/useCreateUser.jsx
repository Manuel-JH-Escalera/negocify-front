import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useCreateUser(options = {}) {
  const queryClient = useQueryClient();
  const { userToken, selectedAlmacen } = useUserStore();

  const createUser= async (userData) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}api/usuarios`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData, almacen_id: selectedAlmacen?.id,}),
      }
    );

    if (!response.ok) {
      throw new Error("Error al crear usuario");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", selectedAlmacen?.id] });
    },
    ...options,
  });
}

export default useCreateUser;
