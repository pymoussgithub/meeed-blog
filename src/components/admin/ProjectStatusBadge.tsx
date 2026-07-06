import { Badge } from "@/components/ui/Badge";

type ProjectStatusBadgeProps = {
  isActive: boolean;
};

export function ProjectStatusBadge({ isActive }: ProjectStatusBadgeProps) {
  return (
    <Badge color={isActive ? "#4ecdc4" : "#94979b"}>
      {isActive ? "Visible" : "Masqué"}
    </Badge>
  );
}
