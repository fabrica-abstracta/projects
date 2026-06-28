import { ComponentProvider } from "./component";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ComponentProvider>
      {children}
      <Toaster richColors closeButton position="bottom-right" />
    </ComponentProvider>
  );
}
