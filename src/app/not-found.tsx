import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page introuvable</h1>
      <p className="mt-4 max-w-md text-primary/70">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button href="/" variant="accent" className="mt-8">
        Retour à l&apos;accueil
      </Button>
      <Link href="/" className="sr-only">
        Accueil
      </Link>
    </div>
  );
}
