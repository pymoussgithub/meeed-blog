import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminProviders } from "@/components/layout/AdminProviders";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminProviders>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader userName={user.name ?? user.email ?? "Utilisateur"} userRole={user.role} />
        <div className="flex flex-col md:flex-row">
          <AdminSidebar userRole={user.role} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
