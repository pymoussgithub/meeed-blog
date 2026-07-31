import { Button } from "@/components/ui/Button";

type ForumAccessGateProps = {
  callbackPath?: string;
};

export function ForumAccessGate({ callbackPath = "/forum" }: ForumAccessGateProps) {
  const encodedCallback = encodeURIComponent(callbackPath);
  const loginHref = `/admin/login?callbackUrl=${encodedCallback}`;
  const registerHref = `/admin/login?mode=register&callbackUrl=${encodedCallback}`;

  return (
    <div className="container-meeed py-6 sm:py-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-accent-dark">
          Espace membres
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-primary-dark sm:text-4xl">
          Forum réservé aux membres
        </h1>
        <p className="mt-4 text-base leading-relaxed text-primary/70">
          Les discussions du forum MEEED sont accessibles uniquement aux personnes
          disposant d&apos;un compte. Cela permet d&apos;échanger dans un cadre
          identifié et de participer en toute confiance.
        </p>
        <p className="mt-3 text-sm text-primary/55">
          Connectez-vous si vous avez déjà un compte, ou créez-en un pour rejoindre
          la communauté.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={loginHref} variant="accent">
            Se connecter
          </Button>
          <Button href={registerHref} variant="outline">
            Créer un compte
          </Button>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            href="/"
            variant="outline"
            className="border-primary/20 text-primary hover:border-primary/35 hover:bg-primary/5"
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
