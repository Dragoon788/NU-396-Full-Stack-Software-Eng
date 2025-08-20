import React, { createContext, useContext } from "react";
import { usePersistence } from "@/hooks/usePersistence";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  isUserLoaded: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId, isUserLoaded] = usePersistence<string | null>('userId', null);

  return (
    <UserContext.Provider value={{ userId, setUserId, isUserLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
