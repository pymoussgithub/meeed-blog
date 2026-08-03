import { Badge } from "@/components/ui/Badge";
import { DOCUMENT_STATUS_COLORS, DOCUMENT_STATUS_LABELS } from "@/lib/admin-labels";

type DocumentStatusBadgeProps = {
  isArchived: boolean;
};

export function DocumentStatusBadge({ isArchived }: DocumentStatusBadgeProps) {
  const key = isArchived ? "ARCHIVED" : "ACTIVE";
  return (
    <Badge color={DOCUMENT_STATUS_COLORS[key]}>
      {DOCUMENT_STATUS_LABELS[key]}
    </Badge>
  );
}
