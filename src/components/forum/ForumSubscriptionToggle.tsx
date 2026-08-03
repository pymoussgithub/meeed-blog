"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setForumTopicSubscriptionAction } from "@/actions/forum.actions";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

type ForumSubscriptionToggleProps = {
  topicId: string;
  initialSubscribed: boolean;
};

export function ForumSubscriptionToggle({
  topicId,
  initialSubscribed,
}: ForumSubscriptionToggleProps) {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setSubscribed(initialSubscribed);
  }, [initialSubscribed]);

  const handleToggle = async () => {
    setPending(true);
    const nextSubscribed = !subscribed;
    const result = await setForumTopicSubscriptionAction(topicId, nextSubscribed);
    setPending(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setSubscribed(nextSubscribed);
    setToast({
      message: nextSubscribed
        ? "Vous suivez maintenant cette discussion."
        : "Vous ne recevez plus les notifications de cette discussion.",
      variant: "success",
    });
    router.refresh();
  };

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant={subscribed ? "outline" : "accent"}
        onClick={handleToggle}
        disabled={pending}
        className="rounded-full px-4 py-2 text-xs sm:text-sm"
        aria-pressed={subscribed}
        data-tour-id="forum.topic.subscribe"
        title={
          subscribed
            ? "Ne plus recevoir les notifications de cette discussion"
            : "Recevoir un e-mail à chaque nouvelle réponse"
        }
      >
        {pending ? "…" : subscribed ? "Se désinscrire" : "S'inscrire"}
      </Button>

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
