import { Suspense } from "react";
import AdminLoginPage from "./page.client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-primary/60">
          Chargement…
        </div>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
