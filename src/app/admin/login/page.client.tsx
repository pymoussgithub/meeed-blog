"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "login" | "register";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await registerAction({ name, email, password });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Compte créé, mais la connexion a échoué. Connectez-vous manuellement.");
        switchMode("login");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <Image src="/logo-meeed.svg" alt="MEEED" width={140} height={56} className="h-12 w-auto" />
          </Link>
        </div>

        <h1 className="text-center text-2xl font-bold text-primary-dark">
          {isLogin ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-center text-sm text-primary/60">
          {isLogin
            ? "Connectez-vous pour accéder à l'espace contributeur"
            : "Rejoignez l'espace contributeur MEEED"}
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={isLogin ? handleLogin : handleRegister}
        >
          {!isLogin ? (
            <Input
              label="Nom"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Votre nom"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          ) : null}
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
            {isLoading
              ? isLogin
                ? "Connexion…"
                : "Création…"
              : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-primary/60">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <button
                type="button"
                className="font-medium text-accent-dark hover:underline"
                onClick={() => switchMode("register")}
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button
                type="button"
                className="font-medium text-accent-dark hover:underline"
                onClick={() => switchMode("login")}
              >
                Se connecter
              </button>
            </>
          )}
        </p>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <Button href="/" variant="outline" className="w-full">
            Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
}
