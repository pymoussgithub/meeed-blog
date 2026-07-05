"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { SITE_CONTACT } from "@/lib/content/site";

export function ContactForm() {
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setToast("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const body = [
      `Nom : ${name}`,
      `E-mail : ${email}`,
      "",
      message,
    ].join("\n");

    const mailto = `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(subject || "Contact MEEED")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setToast("Ouverture de votre client mail…");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4" noValidate>
        <Input name="name" label="Nom complet" required autoComplete="name" />
        <Input
          name="email"
          type="email"
          label="E-mail"
          required
          autoComplete="email"
        />
        <Input name="subject" label="Objet" />
        <Textarea name="message" label="Message" required rows={6} />
        <Button type="submit" variant="accent">
          Envoyer le message
        </Button>
        <p className="text-sm text-primary/60">
          Le formulaire ouvre votre client mail avec un message prérempli à l&apos;adresse{" "}
          <a href={`mailto:${SITE_CONTACT.email}`} className="text-accent-dark hover:underline">
            {SITE_CONTACT.email}
          </a>
          .
        </p>
      </form>

      <Toast
        message={toast ?? ""}
        visible={Boolean(toast)}
        variant="success"
        onClose={() => setToast(null)}
      />
    </>
  );
}
