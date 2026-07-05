"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string;
  visible: boolean;
  onClose?: () => void;
  variant?: "success" | "error" | "info";
  duration?: number;
};

const variantStyles = {
  success: "bg-accent text-white",
  error: "bg-red-600 text-white",
  info: "bg-primary text-white",
};

export function Toast({
  message,
  visible,
  onClose,
  variant = "success",
  duration = 3000,
}: ToastProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (!visible) return;

    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-opacity",
        variantStyles[variant],
      )}
    >
      {message}
    </div>
  );
}
