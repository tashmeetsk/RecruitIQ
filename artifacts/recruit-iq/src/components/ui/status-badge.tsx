import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string, colorClass: string }> = {
  matched: { label: "Matched", colorClass: "bg-[#15803d]/10 text-[#15803d] border-[#15803d]/20" },
  interested: { label: "Interested", colorClass: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20" },
  contacted: { label: "Contacted", colorClass: "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20" },
  open_for_future: { label: "Open for future", colorClass: "bg-[#7e22ce]/10 text-[#7e22ce] border-[#7e22ce]/20" },
  rejected: { label: "Rejected", colorClass: "bg-[#be123c]/10 text-[#be123c] border-[#be123c]/20" },
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const config = statusConfig[status] || { label: status, colorClass: "bg-muted text-muted-foreground" };
  
  return (
    <Badge variant="outline" className={cn("font-medium", config.colorClass, className)}>
      {config.label}
    </Badge>
  );
}
