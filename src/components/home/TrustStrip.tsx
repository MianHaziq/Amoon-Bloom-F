import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";
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

  const items = itemKeys.map(({ titleKey, descriptionKey }) => ({
    title: t(locale, titleKey),
    description: t(locale, descriptionKey, { city: regionCopy.city }),
  }));

  return <TrustStripMarquee items={items} />;
}
