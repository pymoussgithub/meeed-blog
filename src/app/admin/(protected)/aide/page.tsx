import type { Metadata } from "next";
import { HelpWiki } from "@/components/admin/HelpWiki";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getHelpArticles, getHelpIntro } from "@/lib/help-content";

export const metadata: Metadata = {
  title: "Aide",
};

export default async function AdminHelpPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const audience = user.role === "ADMIN" ? "ADMIN" : "CONTRIBUTEUR";
  const intro = getHelpIntro(audience);
  const articles = getHelpArticles(audience);

  return (
    <HelpWiki
      title={intro.title}
      description={intro.description}
      articles={articles}
      audienceLabel={audience === "ADMIN" ? "Espace administrateur" : "Espace contributeur"}
    />
  );
}
