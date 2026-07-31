import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import ForgotPasswordPageClient from "./page.client";

export const metadata: Metadata = buildPageMetadata({
  title: "Mot de passe oublié",
  description: "Recevez un lien pour réinitialiser votre mot de passe MEEED.",
  path: "/mot-de-passe-oublie",
});

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-primary/60">
          Chargement...
        </div>
      }
    >
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
