import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Store = Record<string, string>;

interface StorageContextValue {
  store: Store;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  getItem: (key: string) => string | null;
}

const StorageContext = createContext<StorageContextValue | null>(null);

function readStorage(): Store {
  if (typeof window === "undefined") return {};

  const store: Store = {};

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);

    if (key) {
      store[key] = window.localStorage.getItem(key) ?? "";
    }
  }

  return store;
}

export function StorageProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => readStorage());

  const setItem = useCallback((key: string, value: string) => {
    window.localStorage.setItem(key, value);

    setStore((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const removeItem = useCallback((key: string) => {
    window.localStorage.removeItem(key);

    setStore((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const getItem = useCallback((key: string) => {
    return window.localStorage.getItem(key);
  }, []);

  return (
    <StorageContext.Provider
      value={{
        store,
        setItem,
        removeItem,
        getItem,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error("useStorage must be used within StorageProvider");
  }

  return context;
}
