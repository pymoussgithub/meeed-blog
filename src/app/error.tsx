"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">Erreur</p>
      <h1 className="mt-2 text-3xl font-bold">Une erreur est survenue</h1>
      <p className="mt-4 max-w-md text-primary/70">
        Le chargement de la page a échoué. Vous pouvez réessayer.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-primary/40">digest: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex gap-3">
        <Button type="button" variant="accent" onClick={reset}>
          Réessayer
        </Button>
        <Button href="/" variant="outline">
          Accueil
        </Button>
      </div>
    </div>
  );
}
