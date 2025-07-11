import { createContext, useContext } from "react";

export const AccountContext = createContext<any>(null);
export const useAccount = () => useContext(AccountContext); 