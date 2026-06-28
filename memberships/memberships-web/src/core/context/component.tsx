import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";

type ComponentId = string;

interface OpenOptions<TData = unknown, TResult = unknown> {
  data?: TData;
  onComplete?: (result?: TResult) => void;
}

export interface RegisteredComponentProps<TData = unknown, TResult = unknown> {
  data?: TData;
  close: () => void;
  complete: (result?: TResult) => void;
}

type AnyComponent = ComponentType<RegisteredComponentProps<any, any>>;

interface OpenState {
  id: ComponentId;
  data?: unknown;
  onComplete?: (result?: unknown) => void;
}

interface ComponentContextValue {
  registerComponent: (id: ComponentId, component: AnyComponent) => void;
  openComponent: <TData = unknown, TResult = unknown>(
    id: ComponentId,
    options?: OpenOptions<TData, TResult>,
  ) => void;
  closeComponent: () => void;
}

const ComponentContext = createContext<ComponentContextValue | null>(null);

export function ComponentProvider({ children }: { children: ReactNode }) {
  const components = useRef<Record<ComponentId, AnyComponent>>({});
  const api = useRef<ComponentContextValue | null>(null);
  const [open, setOpen] = useState<OpenState | null>(null);

  if (!api.current) {
    api.current = {
      registerComponent: (id, component) => {
        components.current[id] = component;
      },

      openComponent: (id, options) => {
        if (!components.current[id]) {
          console.warn(`Component "${id}" is not registered.`);
          return;
        }

        setOpen({
          id,
          data: options?.data,
          onComplete: options?.onComplete as
            ((result?: unknown) => void) | undefined,
        });
      },

      closeComponent: () => {
        setOpen(null);
      },
    };
  }

  const Component = open ? components.current[open.id] : null;

  return (
    <ComponentContext.Provider value={api.current}>
      {children}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {open && Component && (
              <Component
                key={open.id}
                data={open.data}
                close={api.current.closeComponent}
                complete={(result) => {
                  open.onComplete?.(result);
                  api.current?.closeComponent();
                }}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ComponentContext.Provider>
  );
}

export function useComponent() {
  const context = useContext(ComponentContext);

  if (!context) {
    throw new Error("useComponent must be used within ComponentProvider");
  }

  return context;
}
