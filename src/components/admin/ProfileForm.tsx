"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/user.actions";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { UserRoleBadge } from "@/components/admin/UserRoleBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

type ProfileFormProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "CONTRIBUTEUR";
  };
  stats: {
    published: number;
    drafts: number;
    archived: number;
    documents: number;
  };
};

export function ProfileForm({ user, stats }: ProfileFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);

    const result = await updateProfileAction({ name });
    setSavingProfile(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Profil mis à jour.", variant: "success" });
    router.refresh();
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);

    const result = await changePasswordAction({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setSavingPassword(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setToast({ message: "Mot de passe modifié.", variant: "success" });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-dark">{user.name}</h2>
            <p className="mt-1 text-sm text-primary/70">{user.email}</p>
          </div>
          <UserRoleBadge role={user.role} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Publiés" value={stats.published} accent="#4ecdc4" />
        <AdminStatCard label="Brouillons" value={stats.drafts} accent="#94979b" />
        <AdminStatCard label="Archivés" value={stats.archived} accent="#292f36" />
        <AdminStatCard label="Documents" value={stats.documents} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleProfileSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <h3 className="font-semibold text-primary-dark">Informations personnelles</h3>
            <p className="mt-1 text-sm text-primary/60">
              Mettez à jour le nom affiché sur vos articles.
            </p>
          </div>
          <Input label="Nom affiché" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={user.email} disabled />
          <Button type="submit" variant="accent" disabled={savingProfile || name === user.name}>
            {savingProfile ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <h3 className="font-semibold text-primary-dark">Sécurité</h3>
            <p className="mt-1 text-sm text-primary/60">
              Changez votre mot de passe de connexion.
            </p>
          </div>
          <Input
            label="Mot de passe actuel"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" variant="accent" disabled={savingPassword}>
            {savingPassword ? "Modification…" : "Modifier le mot de passe"}
          </Button>
        </form>
      </div>

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
