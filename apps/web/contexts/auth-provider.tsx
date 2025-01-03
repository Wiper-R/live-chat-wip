"use client";

import { apiClient } from "@/lib/api-client";
import { createContext } from "@/lib/utils";
import { User } from "@repo/api-types";
import { PropsWithChildren, useCallback, useEffect, useReducer } from "react";

type AuthContextType = {
  state: AuthStateType;
  dispatch: React.Dispatch<AuthActionType>;
};

const [AuthContext, useAuth] = createContext<AuthContextType>();

type AuthStateType =
  | { state: "loading"; user: undefined }
  | { state: "unauthenticated"; user: null }
  | { state: "authenticated"; user: User };

type AuthActionType =
  | { type: "loading" }
  | { type: "unauthenticated" }
  | { type: "authenticated"; user: User };

function authReducer(
  state: AuthStateType,
  action: AuthActionType,
): AuthStateType {
  switch (action.type) {
    case "loading":
      return { state: "loading", user: undefined };
    case "unauthenticated":
      return { state: "unauthenticated", user: null };
    case "authenticated":
      return { state: "authenticated", user: action.user };
    default:
      return state;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, {
    state: "loading",
    user: undefined,
  });

  const fetchUser = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const res = await apiClient.get("/users/@me");
      dispatch({ type: "authenticated", user: res.data });
    } catch (error) {
      console.error("Error fetching user:", error);
      dispatch({ type: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth };
