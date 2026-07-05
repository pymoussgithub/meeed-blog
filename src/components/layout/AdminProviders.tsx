"use client";

import { DialogProvider } from "@/components/ui/DialogProvider";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <DialogProvider>{children}</DialogProvider>;
}
