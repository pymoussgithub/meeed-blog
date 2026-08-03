import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { HELLOASSO_URL, SITE_CONTACT } from "@/lib/content/site";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: "Contactez l'association MEEED.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-meeed py-12">
      <h1 className="text-3xl sm:text-4xl">Contactez-nous</h1>
      <p className="mt-4 max-w-2xl text-primary/70">
        Pour nous écrire, discuter de vos projets maraîchers ou en savoir plus sur nos
        réalisations.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="contact-coords">
          <h2 id="contact-coords" className="text-xl font-semibold">
            L&apos;association
          </h2>
          <address className="mt-4 not-italic text-primary/80">
            <p className="font-medium">{SITE_CONTACT.associationName}</p>
            {SITE_CONTACT.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-4">
              Téléphone :{" "}
              <a
                href={`tel:${SITE_CONTACT.phone}`}
                className="text-accent-dark hover:underline"
              >
                {SITE_CONTACT.phoneDisplay}
              </a>
            </p>
            <p>
              E-mail :{" "}
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="text-accent-dark hover:underline"
                data-tour-id="contact.mailto"
              >
                {SITE_CONTACT.email}
              </a>
            </p>
          </address>

          <div className="mt-8">
            <Button href={HELLOASSO_URL} variant="outline" external>
              Faire un don sur HelloAsso
            </Button>
          </div>
        </section>

        <section aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="text-xl font-semibold">
            Formulaire de contact
          </h2>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
