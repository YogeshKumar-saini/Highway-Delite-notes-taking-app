import { useState } from "react";
import { Context } from "./context";
import App from "@/App";

type UserType = unknown;

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType>(null);

  return (
    <Context.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
    >
      <App />
    </Context.Provider>
  );
};

export default AppWrapper;
