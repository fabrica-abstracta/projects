import { createContext, useContext, type ReactNode } from "react";
import { useStorage } from "./storage";
import { fetch } from "../config/fetch";

type Plans = "basic" | "intermediate" | "advanced";

export interface Plan {
  id: Plans;
  name: string;
  price: number;
  currency: string;
}

export const DEFAULT_PLAN: Plan = {
  id: "basic",
  name: "Básico",
  price: 24.99,
  currency: "PEN",
};

export interface SignInRequest {
  identifier: string;
  password: string;
  isEmployee: boolean;
}

export interface SignUpRequest {
  email: string;
  password: string;
  plan: Plans;
}

export interface Account {
  id: string;
  isOwner: boolean;
  names: string;
  company: {
    id: string;
    preferences: {
      currency: string;
      timezone: string;
      language: string;
      country: string;
    };
  };
  subscription: {
    id: string;
    plan: {
      id: string;
      name: string;
    };
  };
  session: {
    id: string;
    expires: string;
  };
  platform: string;
  iat: number;
  exp: number;
}

interface AuthenticationContextValue {
  account: Account | null;
  isAuthenticated: boolean;
  signIn: (request: SignInRequest) => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthenticationContext = createContext<AuthenticationContextValue | null>(
  null,
);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const { store, setItem, removeItem } = useStorage();

  const account = store["identity"]
    ? (JSON.parse(store["identity"]) as Account)
    : null;

  const signIn = (request: SignInRequest) => {
    return fetch
      .post("sign-in", request)
      .then(() => fetch.get("me"))
      .then((response) => {
        setItem("identity", JSON.stringify(response));
      })
      .catch((error) => {
        removeItem("identity");
        throw error;
      });
  };

  const signUp = (request: SignUpRequest) => {
    return fetch
      .post("sign-up", request)
      .then(() => fetch.get("me"))
      .then((response) => {
        setItem("identity", JSON.stringify(response));
      })
      .catch((error) => {
        removeItem("identity");
        throw error;
      });
  };

  const signOut = () => {
    removeItem("identity");

    return fetch
      .get("sign-out")
      .then(() => undefined)
      .catch(() => undefined);
  };

  return (
    <AuthenticationContext.Provider
      value={{
        account,
        isAuthenticated: !!account,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication() {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      "useAuthentication must be used within AuthenticationProvider",
    );
  }

  return context;
}
