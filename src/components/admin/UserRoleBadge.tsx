import { Badge } from "@/components/ui/Badge";
import { USER_ROLE_COLORS, USER_ROLE_LABELS } from "@/lib/admin-labels";

type UserRoleBadgeProps = {
  role: "ADMIN" | "CONTRIBUTEUR";
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <Badge color={USER_ROLE_COLORS[role] ?? "#94979b"}>
      {USER_ROLE_LABELS[role] ?? role}
    </Badge>
  );
}
