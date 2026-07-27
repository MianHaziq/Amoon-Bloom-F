import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
import { getCachedDeliveryConfig } from "@/services/catalogCache";
import { intlLocale, formatCutoffTime } from "@/lib/format";
import { TrustStripMarquee } from "./TrustStripMarquee";

const itemKeys = [
  { titleKey: "trust.sameDayTitle", descriptionKey: "trust.sameDayDesc" },
  { titleKey: "trust.handTitle",    descriptionKey: "trust.handDesc"    },
  { titleKey: "trust.cardTitle",    descriptionKey: "trust.cardDesc"    },
  { titleKey: "trust.secureTitle",  descriptionKey: "trust.secureDesc"  },
] satisfies { titleKey: MessageKey; descriptionKey: MessageKey }[];

export async function TrustStrip() {
  const [locale, region] = await Promise.all([
    getServerLocale(),
    getServerRegion(),
  ]);
  const regionCopy = await regionCopyFromRegionCode(region, locale);
  // Resolve the region's real same-day cutoff so the trust card quotes it instead of a
  // hardcoded "6 PM". Degrade gracefully if the config can't be fetched.
  const config = await getCachedDeliveryConfig(region ?? undefined).catch(() => null);
  const cutoff =
    config?.sameDayEnabled && config.sameDayCutoff
      ? formatCutoffTime(config.sameDayCutoff, intlLocale(locale))
      : null;

  const items = itemKeys.map(({ titleKey, descriptionKey }) => {
    // Same-day card: use the cutoff-aware copy only when a real cutoff is configured;
    // otherwise a neutral variant that makes no time claim.
    const key: MessageKey =
      descriptionKey === "trust.sameDayDesc" && !cutoff ? "trust.sameDayDescNoCutoff" : descriptionKey;
    return {
      title: t(locale, titleKey),
      description: t(locale, key, { city: regionCopy.city, cutoff: cutoff ?? "" }),
    };
  });

  return <TrustStripMarquee items={items} />;
}
