import { Container } from "@/components/ui";
import {
  TruckIcon,
  ShieldIcon,
  SparkleIcon,
  HeartIcon,
} from "@/components/icons";
import { getServerLocale } from "@/i18n/server";
import { t } from "@/i18n";
import type { MessageKey } from "@/i18n";

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
  const locale = await getServerLocale();
  return (
    <section className="border-y border-ink-100 bg-white">
      <Container className="grid gap-6 py-10 md:grid-cols-2 md:py-12 lg:grid-cols-4">
        {items.map(({ icon: Icon, titleKey, descriptionKey }) => (
          <div key={titleKey} className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-bloom-700">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-display text-base font-medium text-ink-900">
                {t(locale, titleKey)}
              </p>
              <p className="mt-0.5 text-sm text-ink-500">
                {t(locale, descriptionKey)}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
