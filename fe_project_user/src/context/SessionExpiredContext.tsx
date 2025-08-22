"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SessionExpiredContextType {
  isSessionExpired: boolean;
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextType | undefined>(undefined);

export function SessionExpiredProvider({ children }: { children: ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const showSessionExpired = () => {
    setIsSessionExpired(true);
  };

  const hideSessionExpired = () => {
    setIsSessionExpired(false);
  };

  return (
    <SessionExpiredContext.Provider
      value={{
        isSessionExpired,
        showSessionExpired,
        hideSessionExpired,
      }}
    >
      {children}
    </SessionExpiredContext.Provider>
  );
}

export function useSessionExpired() {
  const context = useContext(SessionExpiredContext);
  if (!context) {
    throw new Error("useSessionExpired must be used within a SessionExpiredProvider");
  }
  return context;
}

// Global function to trigger session expired modal from anywhere
let globalShowSessionExpired: (() => void) | null = null;

export function setGlobalSessionExpiredHandler(handler: () => void) {
  globalShowSessionExpired = handler;
}

export function triggerSessionExpired() {
  if (globalShowSessionExpired) {
    globalShowSessionExpired();
  }
}
