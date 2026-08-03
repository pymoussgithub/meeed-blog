import { ForumSubscriptionsTable } from "@/components/admin/ForumSubscriptionsTable";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getSubscribedForumTopicsForUser } from "@/lib/services/forum-subscription.service";

export default async function AdminForumSubscriptionsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const subscriptions = await getSubscribedForumTopicsForUser(currentUser.id);

  return (
    <div className="container-meeed py-10">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-primary-dark">Inscriptions discussions</h1>
        <p className="mt-2 text-primary/70">
          Retrouvez les discussions du forum que vous suivez et désinscrivez-vous en un clic.
        </p>
      </div>

      <div className="mt-8">
        <ForumSubscriptionsTable subscriptions={subscriptions} />
      </div>
    </div>
  );
}
