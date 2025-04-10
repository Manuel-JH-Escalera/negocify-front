import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userToken: "",
      userData: {},
      userAlmacenes: [],
      selectedAlmacen: null,
      setUserToken: (userToken) => set({ userToken }),
      setUserData: (userData) => set({ userData }),
      setUserAlmacenes: (userAlmacenes) => set({ userAlmacenes }),
      setSelectedAlmacen: (selectedAlmacen) => set({ selectedAlmacen }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useUserStore;
