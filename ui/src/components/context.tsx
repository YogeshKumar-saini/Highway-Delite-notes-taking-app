import { createContext } from "react";

type UserType = unknown;

interface ContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

export const Context = createContext<ContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});
