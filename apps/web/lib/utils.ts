import { clsx, type ClassValue } from "clsx";
import React, { useContext } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createContext<T>() {
  const Context = React.createContext<T | undefined>(undefined);

  function useCustomContext() {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(
        `${useCustomContext.name} must be used inside ${Context.displayName}`,
      );
    }

    return ctx;
  }

  return [Context, useCustomContext] as const;
}
