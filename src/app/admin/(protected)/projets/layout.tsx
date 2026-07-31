import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  return children;
}
