"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { resetPasswordWithTokenAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await resetPasswordWithTokenAction({
        token,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(result.data.redirectTo);
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  const isTokenMissing = token.length === 0;

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50 px-4 py-4">
      <div className="m-auto flex max-h-full w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex justify-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <Image src="/logo-meeed.svg" alt="MEEED" width={140} height={56} className="h-12 w-auto" />
          </Link>
        </div>

        <h1 className="text-center text-2xl font-bold text-primary-dark">
          Réinitialiser le mot de passe
        </h1>
        <p className="mt-2 text-center text-sm text-primary/60">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {isTokenMissing ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-red-600">
              Ce lien est incomplet. Demandez un nouveau lien de réinitialisation.
            </p>
            <Button href="/mot-de-passe-oublie" variant="accent" className="w-full">
              Demander un nouveau lien
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nouveau mot de passe"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
              {isLoading ? "Réinitialisation..." : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-primary/60">
          <Link href="/admin/login" className="font-medium text-accent-dark hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
