// src/components/ui/use-toast.ts
import * as React from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  [key: string]: any;
};

type ToastState = Toast[];

const ToastContext = React.createContext<{
  toasts: ToastState;
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => React.useContext(ToastContext);
