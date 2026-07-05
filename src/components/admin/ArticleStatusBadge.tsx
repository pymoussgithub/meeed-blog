import { Badge } from "@/components/ui/Badge";
import { ARTICLE_STATUS_COLORS, ARTICLE_STATUS_LABELS } from "@/lib/admin-labels";

type ArticleStatusBadgeProps = {
  status: string;
};

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  return (
    <Badge color={ARTICLE_STATUS_COLORS[status] ?? "#94979b"}>
      {ARTICLE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
