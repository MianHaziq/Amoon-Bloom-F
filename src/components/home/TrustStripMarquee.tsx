"use client";

import { TruckIcon, ShieldIcon, SparkleIcon, HeartIcon } from "@/components/icons";

const ICONS = [TruckIcon, SparkleIcon, HeartIcon, ShieldIcon];

interface TrustItem {
  title: string;
  description: string;
}

interface Props {
  items: TrustItem[];
}

export function TrustStripMarquee({ items }: Props) {
  const rich = items.map((item, i) => ({ ...item, Icon: ICONS[i] }));
  const doubled = [...rich, ...rich];

  return (
    <section className="relative overflow-hidden bg-ink-900 border-y border-white/5">
      {/* Left edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-900 to-transparent" />
      {/* Right edge fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-900 to-transparent" />

      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: "26s" }}
      >
        {doubled.map(({ Icon, title, description }, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-3 px-10 py-10 md:px-14 md:py-12">
              {/* Icon with continuously pulsing bloom ring */}
              <span className="relative flex-shrink-0">
                <span
                  className="absolute inset-0 animate-ping rounded-full bg-bloom-400"
                  style={{
                    opacity: 0.14,
                    animationDuration: "2.4s",
                    animationDelay: `${(i % 4) * 0.55}s`,
                  }}
                />
                <span
                  className="animate-bloom-glow relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-bloom-400 ring-1 ring-white/10"
                  style={{ animationDelay: `${(i % 4) * 0.55}s` }}
                >
                  <Icon size={17} />
                </span>
              </span>

              {/* Text */}
              <div>
                <p className="whitespace-nowrap font-display text-sm font-semibold text-cream-50 md:text-base">
                  {title}
                </p>
                <p className="whitespace-nowrap text-xs text-ink-400 md:text-sm">
                  {description}
                </p>
              </div>
            </div>

            {/* Separator diamond */}
            <span className="flex-shrink-0 select-none text-bloom-600/30">◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}
