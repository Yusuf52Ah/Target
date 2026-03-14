import type { OrderStatus } from "@prisma/client";

import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        ORDER_STATUS_COLORS[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
