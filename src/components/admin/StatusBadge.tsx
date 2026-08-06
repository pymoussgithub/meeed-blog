import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge color={isActive ? "#4ecdc4" : "#94979b"}>
      {isActive ? "Visible" : "Masqué"}
    </Badge>
  );
}
