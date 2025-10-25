import * as React from "react";
import { useState } from "react";

type Toast = {
  id: number;
  title: string;
  description?: string;
};

let addToast: (toast: Omit<Toast, "id">) => void;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  React.useEffect(() => {
    addToast = (toast) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, ...toast }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000); // Auto-hide after 3s
    };
  }, []);

  return { toasts };
}

export function toast(toast: Omit<Toast, "id">) {
  if (addToast) addToast(toast);
}
