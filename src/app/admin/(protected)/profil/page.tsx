import { ProfileForm } from "@/components/admin/ProfileForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardStats } from "@/lib/services/article.service";
import { getUserById } from "@/lib/services/user.service";

export default async function AdminProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [user, stats] = await Promise.all([
    getUserById(currentUser.id),
    getDashboardStats(currentUser.id, currentUser.role === "ADMIN"),
  ]);

  if (!user) return null;

  return (
    <div className="container-meeed py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-primary-dark">Mon profil</h1>
        <p className="mt-2 text-primary/70">
          Gérez vos informations personnelles et consultez votre activité sur la plateforme.
        </p>
      </div>
      <div className="mt-8">
        <ProfileForm
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }}
          stats={{
            published: stats.published,
            drafts: stats.drafts,
            archived: stats.archived,
            documents: stats.documents,
          }}
        />
      </div>
    </div>
  );
}
