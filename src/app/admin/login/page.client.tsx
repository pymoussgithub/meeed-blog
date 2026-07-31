"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sanitizeInternalPath } from "@/lib/safe-redirect";
import { emitTourSuccess } from "@/lib/tour/validation";

type AuthMode = "login" | "register";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeInternalPath(searchParams.get("callbackUrl"), "/admin");
  const resetStatus = searchParams.get("reset");
  const initialMode: AuthMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
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

      emitTourSuccess({ target: "auth.login.submit" });
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
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-primary-dark">
            {isLogin ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="mt-1.5 text-sm text-primary/60">
            {isLogin
              ? "Connectez-vous pour accéder à l'espace contributeur"
              : "Rejoignez l'espace contributeur MEEED"}
          </p>
        </header>

        {isLogin && resetStatus === "success" ? (
          <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
          </p>
        ) : null}

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={isLogin ? handleLogin : handleRegister}
        >
          <div className="flex flex-col gap-4">
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
              data-tour-id={isLogin ? "auth.login.email" : undefined}
            />
            <div className="flex flex-col gap-1.5">
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                data-tour-id={isLogin ? "auth.login.password" : undefined}
              />
              {isLogin ? (
                <div className="text-right">
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-accent-dark hover:underline"
                    data-tour-id="auth.forgot-password"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={isLoading}
            data-tour-id={isLogin ? "auth.login.submit" : undefined}
          >
            {isLoading
              ? isLogin
                ? "Connexion…"
                : "Création…"
              : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
          </Button>
        </form>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-primary/60">
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  className="font-medium text-accent-dark hover:underline"
                  onClick={() => switchMode("register")}
                  data-tour-id="auth.login.register"
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
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-primary/50 transition-colors hover:text-primary"
            data-tour-id="auth.login.back-home"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
