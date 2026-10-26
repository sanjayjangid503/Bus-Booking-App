import { CircleCheck, CircleX, Clock, Flag } from "lucide-react";
import { STATUS_LABEL } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Feedback";

const config = {
  CONFIRMED: { tone: "success", Icon: CircleCheck },
  PENDING: { tone: "warning", Icon: Clock },
  CANCELLED: { tone: "danger", Icon: CircleX },
  COMPLETED: { tone: "neutral", Icon: Flag },
} as const;

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { tone, Icon } = config[status];
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5" /> {STATUS_LABEL[status]}
    </Badge>
  );
}
