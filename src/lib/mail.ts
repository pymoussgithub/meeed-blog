import nodemailer from "nodemailer";
import { absoluteUrl } from "@/lib/seo";

type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function shouldRejectUnauthorizedTls() {
  const raw = process.env.SMTP_TLS_REJECT_UNAUTHORIZED;
  if (raw === "false" || raw === "0") return false;
  if (raw === "true" || raw === "1") return true;
  // En local, les antivirus Windows injectent souvent un certificat auto-signé.
  return process.env.NODE_ENV === "production";
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    tls: {
      rejectUnauthorized: shouldRejectUnauthorizedTls(),
    },
  });
}

/** Envoi transactionnel. Ne throw pas vers l'appelant métier si SMTP absent / en échec. */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.info("[mail] SMTP non configuré — e-mail ignoré:", input.subject);
    return false;
  }

  try {
    const transport = createTransport();
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? input.text.replace(/\n/g, "<br/>"),
    });
    return true;
  } catch (error) {
    console.error("[mail] Échec d'envoi:", error);
    return false;
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function notifyForumParticipantsOfReply(input: {
  topicTitle: string;
  topicSlug: string;
  replyBody: string;
  recipientEmails: string[];
}) {
  const emails = [...new Set(input.recipientEmails.filter(Boolean))];
  if (emails.length === 0) return;

  const url = absoluteUrl(`/forum/s/${input.topicSlug}`);
  const excerpt = stripHtml(input.replyBody).slice(0, 280);
  const subject = `Nouvelle réponse — ${input.topicTitle}`;
  const text = [
    `Une nouvelle réponse a été publiée sur le sujet « ${input.topicTitle} ».`,
    "",
    excerpt ? `Extrait : ${excerpt}` : "",
    "",
    `Lire la discussion : ${url}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  await sendMail({
    to: emails,
    subject,
    text,
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<boolean> {
  const subject = "Réinitialisation de votre mot de passe";
  const text = [
    `Bonjour ${input.name},`,
    "",
    "Une demande de réinitialisation de mot de passe a été reçue pour votre compte MEEED.",
    "Si vous êtes à l'origine de cette demande, utilisez le lien ci-dessous pour choisir un nouveau mot de passe :",
    "",
    input.resetUrl,
    "",
    "Ce lien expire dans 1 heure et ne peut être utilisé qu'une seule fois.",
    "Si vous n'avez rien demandé, vous pouvez ignorer cet e-mail.",
  ].join("\n");

  return sendMail({
    to: input.email,
    subject,
    text,
  });
}

export async function sendAccountCreatedEmail(input: {
  email: string;
  name: string;
}) {
  const loginUrl = absoluteUrl("/admin/login");
  const subject = "Votre compte MEEED a bien été créé";
  const text = [
    `Bonjour ${input.name},`,
    "",
    "Votre compte MEEED a bien été créé.",
    "Vous pouvez dès maintenant vous connecter à l'espace contributeur :",
    "",
    loginUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette inscription, contactez-nous.",
  ].join("\n");

  await sendMail({
    to: input.email,
    subject,
    text,
  });
}
