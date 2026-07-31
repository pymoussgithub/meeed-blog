"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  updateUserAction,
} from "@/actions/user.actions";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { UserRoleBadge } from "@/components/admin/UserRoleBadge";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { USER_ROLE_LABELS } from "@/lib/admin-labels";
import { cn, formatDate } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CONTRIBUTEUR";
  isActive: boolean;
  createdAt: Date | string;
  _count: { articles: number };
};

type UserStats = {
  total: number;
  active: number;
  admins: number;
  contributors: number;
  totalArticles: number;
};

type UsersManagerProps = {
  users: UserRow[];
  stats: UserStats;
  currentUserId: string;
};

type RoleFilter = "ALL" | "ADMIN" | "CONTRIBUTEUR";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UsersManager({ users, stats, currentUserId }: UsersManagerProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CONTRIBUTEUR">("CONTRIBUTEUR");
  const [creating, setCreating] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !user.isActive) return false;
      if (statusFilter === "INACTIVE" && user.isActive) return false;
      if (!query) return true;

      return (
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);

    const result = await createUserAction({ name, email, password, role });
    setCreating(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("CONTRIBUTEUR");
    setShowCreateForm(false);
    setToast({ message: "Compte créé. Un e-mail de confirmation a été envoyé.", variant: "success" });
    router.refresh();
  };

  const handleUpdate = async (
    userId: string,
    data: Parameters<typeof updateUserAction>[1],
    successMessage: string,
  ) => {
    const result = await updateUserAction(userId, data);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return false;
    }

    setToast({ message: successMessage, variant: "success" });
    router.refresh();
    return true;
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetUserId) return;

    const result = await resetUserPasswordAction(resetUserId, { password: resetPassword });

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setResetUserId(null);
    setResetPassword("");

    if (result.data.requiresReauth) {
      router.push("/admin/login?reset=success");
      return;
    }

    setToast({ message: "Mot de passe réinitialisé.", variant: "success" });
  };

  const handleDeleteUser = async (user: UserRow) => {
    const confirmed = await confirm(
      `Vous allez supprimer définitivement le compte de ${user.name} (${user.email}).\n\nSes articles, documents et messages du forum seront réattribués à votre compte. Cette action est irréversible.`,
      {
        title: "Supprimer cet utilisateur ?",
        variant: "danger",
        confirmLabel: "Supprimer définitivement",
        cancelLabel: "Annuler",
      },
    );

    if (!confirmed) return;

    const result = await deleteUserAction(user.id);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Utilisateur supprimé définitivement.", variant: "success" });
    router.refresh();
  };

  const resetTarget = users.find((user) => user.id === resetUserId);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Utilisateurs" value={stats.total} hint={`${stats.active} actifs`} />
        <AdminStatCard
          label="Administrateurs"
          value={stats.admins}
          accent="#292f36"
        />
        <AdminStatCard
          label="Contributeurs"
          value={stats.contributors}
          accent="#4ecdc4"
        />
        <AdminStatCard
          label="Articles publiés"
          value={stats.totalArticles}
          hint="Tous auteurs confondus"
        />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setShowCreateForm((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <div>
            <h2 className="font-semibold text-primary-dark">Créer un compte</h2>
            <p className="mt-0.5 text-sm text-primary/60">
              Ajoutez un contributeur ou un administrateur
            </p>
          </div>
          <span className="text-xl text-primary/40">{showCreateForm ? "−" : "+"}</span>
        </button>

        {showCreateForm ? (
          <form
            onSubmit={handleCreate}
            className="space-y-4 border-t border-gray-100 px-5 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nom complet" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Mot de passe temporaire"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <div>
                <label htmlFor="create-role" className="mb-1.5 block text-sm font-medium text-primary-dark">
                  Rôle
                </label>
                <select
                  id="create-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "CONTRIBUTEUR")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="CONTRIBUTEUR">Contributeur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="accent" disabled={creating}>
                {creating ? "Création…" : "Créer le compte"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary-dark">
              Comptes ({filteredUsers.length})
            </h2>
            <p className="mt-1 text-sm text-primary/60">
              Recherchez, filtrez et gérez les accès au back-office.
            </p>
          </div>
          <Input
            type="search"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ALL", "Tous"],
              ["ADMIN", "Admins"],
              ["CONTRIBUTEUR", "Contributeurs"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRoleFilter(value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                roleFilter === value
                  ? "bg-accent text-white"
                  : "bg-white text-primary/70 ring-1 ring-gray-200 hover:bg-gray-50",
              )}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:inline" />
          {(
            [
              ["ALL", "Tous statuts"],
              ["ACTIVE", "Actifs"],
              ["INACTIVE", "Inactifs"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === value
                  ? "bg-primary text-white"
                  : "bg-white text-primary/70 ring-1 ring-gray-200 hover:bg-gray-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-primary/60">
                    Aucun utilisateur ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isEditing = editingId === user.id;

                  return (
                    <tr key={user.id} className={cn(!user.isActive && "bg-gray-50/80")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                              user.isActive
                                ? "bg-bg-soft text-accent-dark"
                                : "bg-gray-200 text-primary/50",
                            )}
                          >
                            {getInitials(user.name)}
                          </span>
                          <div className="min-w-0">
                            {isEditing ? (
                              <form
                                className="flex items-center gap-2"
                                onSubmit={async (event) => {
                                  event.preventDefault();
                                  const ok = await handleUpdate(
                                    user.id,
                                    { name: editingName },
                                    "Nom mis à jour.",
                                  );
                                  if (ok) setEditingId(null);
                                }}
                              >
                                <input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="w-full min-w-[140px] rounded border border-gray-300 px-2 py-1 text-sm"
                                  required
                                  minLength={2}
                                />
                                <button type="submit" className="text-accent-dark hover:underline">
                                  OK
                                </button>
                                <button
                                  type="button"
                                  className="text-primary/50 hover:underline"
                                  onClick={() => setEditingId(null)}
                                >
                                  ✕
                                </button>
                              </form>
                            ) : (
                              <p className="font-medium text-primary-dark">{user.name}</p>
                            )}
                            <p className="truncate text-xs text-primary/60">{user.email}</p>
                            {isSelf ? (
                              <span className="mt-0.5 inline-block text-[10px] font-medium uppercase tracking-wide text-accent-dark">
                                Vous
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <UserRoleBadge role={user.role} />
                        ) : (
                          <select
                            defaultValue={user.role}
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs"
                            onChange={async (event) => {
                              await handleUpdate(
                                user.id,
                                { role: event.target.value as "ADMIN" | "CONTRIBUTEUR" },
                                `Rôle mis à jour : ${USER_ROLE_LABELS[event.target.value]}.`,
                              );
                            }}
                          >
                            <option value="CONTRIBUTEUR">Contributeur</option>
                            <option value="ADMIN">Administrateur</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user._count.articles > 0 ? (
                          <Link
                            href={`/admin/articles?q=${encodeURIComponent(user.name)}`}
                            className="font-medium text-accent-dark hover:underline"
                          >
                            {user._count.articles} article{user._count.articles > 1 ? "s" : ""}
                          </Link>
                        ) : (
                          <span className="text-primary/40">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-primary/70">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            defaultChecked={user.isActive}
                            disabled={isSelf}
                            onChange={async (event) => {
                              await handleUpdate(
                                user.id,
                                { isActive: event.target.checked },
                                event.target.checked
                                  ? "Compte activé."
                                  : "Compte désactivé.",
                              );
                            }}
                          />
                          <span
                            className={cn(
                              "relative h-6 w-11 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5",
                              isSelf && "opacity-50",
                            )}
                          />
                          <span className="text-xs text-primary/70 peer-checked:hidden">
                            Inactif
                          </span>
                          <span className="hidden text-xs text-primary/70 peer-checked:inline">
                            Actif
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {!isEditing ? (
                            <button
                              type="button"
                              className="text-accent-dark hover:underline"
                              onClick={() => {
                                setEditingId(user.id);
                                setEditingName(user.name);
                              }}
                            >
                              Renommer
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="text-primary/70 hover:underline"
                            onClick={() => {
                              setResetUserId(user.id);
                              setResetPassword("");
                            }}
                          >
                            Mot de passe
                          </button>
                          {!isSelf ? (
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => handleDeleteUser(user)}
                            >
                              Supprimer
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {resetUserId && resetTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-primary-dark">Réinitialiser le mot de passe</h3>
            <p className="mt-2 text-sm text-primary/70">
              Nouveau mot de passe pour <strong>{resetTarget.name}</strong> ({resetTarget.email})
            </p>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <Input
                label="Nouveau mot de passe"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
                minLength={8}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="accent">
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setResetUserId(null);
                    setResetPassword("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
