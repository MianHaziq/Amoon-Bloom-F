import { getServerLocale } from "@/i18n/server";
import { getServerRegion, getServerZoneName } from "@/services/serverRegion";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
import { getCachedDeliveryConfigForZone, getCachedDeliveryZones } from "@/services/catalogCache";
import { intlLocale, formatCutoffTime } from "@/lib/format";
import { TrustStripMarquee } from "./TrustStripMarquee";

const itemKeys = [
  { titleKey: "trust.sameDayTitle", descriptionKey: "trust.sameDayDesc" },
  { titleKey: "trust.handTitle",    descriptionKey: "trust.handDesc"    },
  { titleKey: "trust.cardTitle",    descriptionKey: "trust.cardDesc"    },
  { titleKey: "trust.secureTitle",  descriptionKey: "trust.secureDesc"  },
] satisfies { titleKey: MessageKey; descriptionKey: MessageKey }[];

export async function TrustStrip() {
  const [locale, region, zoneName] = await Promise.all([
    getServerLocale(),
    getServerRegion(),
    getServerZoneName(),
  ]);
  const regionCopy = await regionCopyFromRegionCode(region, locale);
  // Resolve the selected city/zone NAME (cookie) → zone id, so same-day tracks the SELECTED
  // zone (zone override wins over region). No/stale zone → region-level fallback.
  let zoneId: string | undefined;
  if (zoneName && region) {
    const zones = await getCachedDeliveryZones(region).catch(() => []);
    zoneId = zones.find((z) => z.name === zoneName)?.id;
  }
  // Zone-resolved config so the same-day card reflects whether THIS zone offers same-day.
  const config = await getCachedDeliveryConfigForZone(region ?? undefined, zoneId).catch(() => null);
  const sameDayEnabled = Boolean(config?.sameDayEnabled);
  const cutoff =
    sameDayEnabled && config?.sameDayCutoff
      ? formatCutoffTime(config.sameDayCutoff, intlLocale(locale))
      : null;

  const items = itemKeys
    // Drop the same-day card ENTIRELY when the selected zone (or its region) doesn't offer
    // same-day — no "same-day" claim should show for a zone that can't fulfil it.
    .filter(({ titleKey }) => titleKey !== "trust.sameDayTitle" || sameDayEnabled)
    .map(({ titleKey, descriptionKey }) => {
      // Same-day card: use the cutoff-aware copy only when a real cutoff is configured;
      // otherwise a neutral variant that makes no time claim.
      const key: MessageKey =
        descriptionKey === "trust.sameDayDesc" && !cutoff ? "trust.sameDayDescNoCutoff" : descriptionKey;
      return {
        title: t(locale, titleKey),
        description: t(locale, key, { country: regionCopy.country, cutoff: cutoff ?? "" }),
      };
    });

  return <TrustStripMarquee items={items} />;
}
