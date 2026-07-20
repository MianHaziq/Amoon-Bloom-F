import { Badge } from "@/components/ui";
import { useT } from "@/i18n/useT";

const MAX_CHIPS = 3;

interface RegionBadgesProps {
  regions: { id: string; code: string }[] | undefined;
}

/**
 * Read-only region-visibility summary for admin list tables (Products,
 * Categories, Sections) — mirrors the permission-chip pattern from
 * ManagersAdminPage.tsx. An empty array is a real, distinct state ("no rows =
 * visible in none" per the region-scoping join tables), not "not loaded yet",
 * so it gets its own flagged badge rather than looking like a blank cell.
 */
export function RegionBadges({ regions }: RegionBadgesProps) {
  const { t } = useT();
  const list = regions ?? [];

  if (list.length === 0) {
    return (
      <Badge tone="danger">{t("admin.common.regionsHidden")}</Badge>
    );
  }

  const shown = list.slice(0, MAX_CHIPS);
  const extra = list.length - shown.length;
  return (
    <div className="flex max-w-56 flex-wrap gap-1">
      {shown.map((r) => (
        <Badge key={r.id} tone="bloom">
          {r.code}
        </Badge>
      ))}
      {extra > 0 ? <Badge tone="neutral">{`+${extra}`}</Badge> : null}
    </div>
  );
}
