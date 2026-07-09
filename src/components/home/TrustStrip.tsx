import { Container } from "@/components/ui";
import { StaggerGroup, StaggerItem } from "@/components/motion/primitives";
import {
  TruckIcon,
  ShieldIcon,
  SparkleIcon,
  HeartIcon,
} from "@/components/icons";
import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n";
import { regionCopyFromRegionCode } from "@/features/location/regionCopy";

const items = [
  {
    icon: TruckIcon,
    titleKey: "trust.sameDayTitle",
    descriptionKey: "trust.sameDayDesc",
  },
  {
    icon: SparkleIcon,
    titleKey: "trust.handTitle",
    descriptionKey: "trust.handDesc",
  },
  {
    icon: HeartIcon,
    titleKey: "trust.cardTitle",
    descriptionKey: "trust.cardDesc",
  },
  {
    icon: ShieldIcon,
    titleKey: "trust.secureTitle",
    descriptionKey: "trust.secureDesc",
  },
] satisfies {
  icon: typeof TruckIcon;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
}[];

export async function TrustStrip() {
  const [locale, region] = await Promise.all([
    getServerLocale(),
    getServerRegion(),
  ]);
  const regionCopy = regionCopyFromRegionCode(region, locale);
  return (
    <section className="border-y border-ink-100 bg-white">
      <Container className="py-10 md:py-12">
        <StaggerGroup
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {items.map(({ icon: Icon, titleKey, descriptionKey }) => (
            <StaggerItem key={titleKey} className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-display text-base font-medium text-ink-900">
                  {t(locale, titleKey)}
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  {t(locale, descriptionKey, { city: regionCopy.city })}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
