import { UsersManager } from "@/components/admin/UsersManager";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAllUsers, getUserStats } from "@/lib/services/user.service";

export default async function AdminUsersPage() {
  const [users, stats, currentUser] = await Promise.all([
    getAllUsers(),
    getUserStats(),
    getCurrentUser(),
  ]);

  if (!currentUser) return null;

  return (
    <div className="container-meeed py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-primary-dark">Utilisateurs</h1>
        <p className="mt-2 text-primary/70">
          Gérez les comptes contributeurs et administrateurs, leurs accès et leurs mots de passe.
        </p>
      </div>
      <div className="mt-8">
        <UsersManager users={users} stats={stats} currentUserId={currentUser.id} />
      </div>
    </div>
  );
}
