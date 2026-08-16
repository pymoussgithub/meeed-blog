import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { DemoTourProvider } from "@/components/tour/DemoTourProvider";
import { DevAccountSwitcher } from "@/components/dev/DevAccountSwitcher";
import { NavigationLoadingOverlay } from "@/components/layout/NavigationLoadingOverlay";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { isDevAccountSwitcherEnabled } from "@/lib/dev-mode";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

// Pas de force-dynamic ici : le build Infomaniak est déjà limité via next.config
// (cpus: 1, staticGenerationMaxConcurrency: 1). Un layout dynamique force un
// aller-retour RSC + auth/DB à chaque clic de navigation.

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function resolveMetadataBase(): URL {
  const raw = process.env.NEXTAUTH_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // NEXTAUTH_URL mal formée en prod → fallback plutôt que crash RSC global
    }
  }
  return new URL("https://meeed.fr");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: `${SITE_NAME} — Maraîchage Efficient en Eau et en Énergie Décarbonée`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const devModeEnabled = isDevAccountSwitcherEnabled();

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
          <DemoTourProvider>
            {children}
            <Suspense fallback={null}>
              <NavigationLoadingOverlay />
            </Suspense>
            {devModeEnabled ? (
              <Suspense fallback={null}>
                <DevAccountSwitcher />
              </Suspense>
            ) : null}
          </DemoTourProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
