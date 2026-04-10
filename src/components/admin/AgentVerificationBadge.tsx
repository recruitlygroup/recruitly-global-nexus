/**
 * src/components/admin/AgentVerificationBadge.tsx
 *
 * Small inline badge showing agent verification status.
 * Used in: AdminPartnersTab, PartnerDashboard header.
 */

import { ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  isVerified: boolean;
  size?: "sm" | "md";
}

export default function AgentVerificationBadge({ isVerified, size = "sm" }: Props) {
  if (isVerified) {
    return (
      <Badge className={`bg-green-500/20 text-green-400 border-green-500/30 ${size === "md" ? "text-sm px-3 py-1" : "text-xs"}`}>
        <ShieldCheck className={`${size === "md" ? "w-4 h-4" : "w-3 h-3"} mr-1`} />
        Verified Agent
      </Badge>
    );
  }
  return (
    <Badge className={`bg-red-500/20 text-red-400 border-red-500/30 ${size === "md" ? "text-sm px-3 py-1" : "text-xs"}`}>
      <ShieldX className={`${size === "md" ? "w-4 h-4" : "w-3 h-3"} mr-1`} />
      Not Verified
    </Badge>
  );
}
