import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import ResetPasswordPageClient from "./page.client";

export const metadata: Metadata = buildPageMetadata({
  title: "Réinitialiser le mot de passe",
  description: "Définissez un nouveau mot de passe pour votre compte MEEED.",
  path: "/reinitialiser-mot-de-passe",
});

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-primary/60">
          Chargement...
        </div>
      }
    >
      <ResetPasswordPageClient />
    </Suspense>
  );
}
