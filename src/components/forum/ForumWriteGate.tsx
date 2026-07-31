import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth-helpers";

type ForumWriteGateProps = {
  callbackPath: string;
  children: React.ReactNode;
};

/** Affiche les enfants si connecté, sinon CTA de connexion. */
export async function ForumWriteGate({ callbackPath, children }: ForumWriteGateProps) {
  const user = await getCurrentUser();

  if (!user) {
    const encodedCallback = encodeURIComponent(callbackPath);
    const loginHref = `/admin/login?callbackUrl=${encodedCallback}`;
    const registerHref = `/admin/login?mode=register&callbackUrl=${encodedCallback}`;

    return (
      <div
        className="rounded-lg border border-primary/10 bg-bg-soft/30 px-4 py-5"
        data-tour-id="forum.topic.reply-gate"
      >
        <p className="text-sm text-primary/70">
          Connectez-vous pour participer aux discussions du forum.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button href={loginHref} variant="accent">
            Se connecter
          </Button>
          <Button href={registerHref} variant="outline">
            Créer un compte
          </Button>
        </div>
        <p className="mt-2 text-xs text-primary/45">
          Pas encore de compte ?{" "}
          <Link
            href={registerHref}
            className="underline underline-offset-2 hover:text-accent-dark"
          >
            Inscrivez-vous gratuitement
          </Link>
          .
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
