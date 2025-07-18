"use client";
import React, { createContext, useContext, useState } from "react";

export const AccountContext = createContext<any>(null);
export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children, initialData }: { children: React.ReactNode, initialData: any }) => {
  const [account, setAccount] = useState(initialData);
  return (
    <AccountContext.Provider value={{ ...account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}; 