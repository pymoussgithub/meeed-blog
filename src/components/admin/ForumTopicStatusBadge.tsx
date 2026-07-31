import { Badge } from "@/components/ui/Badge";
import {
  FORUM_TOPIC_STATUS_COLORS,
  FORUM_TOPIC_STATUS_LABELS,
} from "@/lib/admin-labels";

type ForumTopicStatusBadgeProps = {
  status: string;
};

export function ForumTopicStatusBadge({ status }: ForumTopicStatusBadgeProps) {
  return (
    <Badge color={FORUM_TOPIC_STATUS_COLORS[status] ?? "#94979b"}>
      {FORUM_TOPIC_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
