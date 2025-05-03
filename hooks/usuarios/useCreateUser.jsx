import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../stores/userStore";

function useCreateUser(options = {}) {
  const queryClient = useQueryClient();
  const { userToken } = useUserStore();

  const createUser = async (userData) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // no envolverlo como { usuario: userData }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al crear el usuario");
    }

    return data;
  };

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    ...options,
  });
}

export default useCreateUser;
