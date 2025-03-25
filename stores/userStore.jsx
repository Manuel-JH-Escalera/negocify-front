import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userToken: "",
      userData: {},
      setUserToken: (userToken) => set({ userToken }),
      setUserData: (userData) => set({ userData }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useUserStore;
