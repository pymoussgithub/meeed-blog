import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoTourProvider } from "@/components/tour/DemoTourProvider";
import { DevAccountSwitcher } from "@/components/dev/DevAccountSwitcher";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isDemoTourEnabled } from "@/lib/tour/flag";
import { isDevAccountSwitcherEnabled } from "@/lib/dev-mode";
import { getAllUsers } from "@/lib/services/user.service";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

// Evite le pool de workers SSG (EAGAIN sur Infomaniak / hebergements limites).
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://meeed.fr"),
  title: {
    default: `${SITE_NAME} — Maraichage Efficient en Eau et en Energie Décarbonée`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const devModeEnabled = isDevAccountSwitcherEnabled();
  const demoTourEnabled = isDemoTourEnabled();
  const user = devModeEnabled || demoTourEnabled ? await getCurrentUser() : null;
  const accounts = devModeEnabled
    ? await getAllUsers().then((users) =>
        users
          .filter((account) => account.isActive)
          .map((account) => ({
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
          })),
      )
    : [];
  const sessionRole =
    user?.role === "ADMIN" || user?.role === "CONTRIBUTEUR" ? user.role : null;

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" crossOrigin="anonymous" />
        <link
          href="https://fonts.bunny.net/css?family=Chivo:400,700|Roboto:400,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <DialogProvider>
          <DemoTourProvider sessionRole={sessionRole}>
            {children}
            {devModeEnabled ? (
              <DevAccountSwitcher currentUserId={user?.id ?? null} accounts={accounts} />
            ) : null}
          </DemoTourProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
