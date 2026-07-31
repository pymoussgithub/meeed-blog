"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordResetAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { emitTourSuccess } from "@/lib/tour/validation";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await requestPasswordResetAction({ email });
      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(result.data.message);
      setEmail("");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50 px-4 py-4">
      <div className="m-auto flex max-h-full w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex justify-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <Image src="/logo-meeed.svg" alt="MEEED" width={140} height={56} className="h-12 w-auto" />
          </Link>
        </div>

        <h1 className="text-center text-2xl font-bold text-primary-dark">Mot de passe oublié</h1>
        <p className="mt-2 text-center text-sm text-primary/60">
          Saisissez votre e-mail pour recevoir un lien de réinitialisation.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            data-tour-id="auth.forgot.email"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={isLoading}
            data-tour-id="auth.forgot.submit"
          >
            {isLoading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-primary/60">
          <Link href="/admin/login" className="font-medium text-accent-dark hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
