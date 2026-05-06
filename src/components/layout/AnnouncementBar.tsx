import { Container } from "@/components/ui";
import { TruckIcon, SparkleIcon, PinIcon } from "@/components/icons";

const items = [
  { icon: TruckIcon, label: "Same-day delivery in Dubai · order before 6 PM" },
  { icon: SparkleIcon, label: "Hand-packed in our Dubai boutique" },
  { icon: PinIcon, label: "Boutique branches across the UAE" },
];

export function AnnouncementBar() {
  return (
    <div className="hidden bg-ink-900 text-cream-100 lg:block">
      <Container className="flex h-9 items-center justify-between text-xs">
        <div className="flex items-center gap-8">
          {items.slice(0, 2).map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon size={14} className="text-bloom-300" />
              <span className="tracking-wide text-cream-100/80">{label}</span>
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-2">
          <PinIcon size={14} className="text-bloom-300" />
          <span className="tracking-wide text-cream-100/80">
            {items[2].label}
          </span>
        </span>
      </Container>
    </div>
  );
}
