"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { AE, SA } from "country-flag-icons/react/3x2";
import { Modal, Button } from "@/components/ui";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { tapScale, popFeedback } from "@/lib/motion";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocation } from "@/store/slices/location.slice";
import { COUNTRIES, type CountryCode, getCountry } from "@/features/location/data";
import { profileApi } from "@/features/auth/api/profile.api";
import { useT } from "@/i18n/useT";

interface LocationSheetProps {
  open: boolean;
  onClose: () => void;
}

// Explicit named imports (rather than a namespace + dynamic lookup) so only
// these two flags end up in the bundle, not all 265 the package ships.
const FLAGS: Record<CountryCode, typeof AE> = {
  UAE: AE,
  SAUDI_ARABIA: SA,
};

/** Shared row for both the country and city pickers — same visual language
 *  (leading visual, label + sublabel, trailing radio) so the two steps read
 *  as one system instead of two different UI patterns. */
function OptionRow({
  selected,
  onClick,
  leading,
  label,
  sublabel,
}: {
  selected: boolean;
  onClick: () => void;
  leading?: ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <m.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      {...tapScale}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-start transition-colors duration-150",
        selected
          ? "border-bloom-500/70 bg-bloom-50/80 shadow-[0_6px_20px_-8px_rgba(190,24,93,0.35)]"
          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50/60"
      )}
    >
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm font-semibold",
            selected ? "text-bloom-800" : "text-ink-900"
          )}
        >
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-ink-400">{sublabel}</span>
        )}
      </span>
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
          selected
            ? "border-bloom-600 bg-bloom-600 text-white"
            : "border-ink-300 text-transparent"
        )}
      >
        <AnimatePresence>
          {selected && (
            <m.span
              variants={popFeedback}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex"
            >
              <CheckIcon size={12} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </m.button>
  );
}

/**
 * Two-step modal that captures delivery country + city. Used both for the
 * onboarding gate (when `hasChosen` is false) and the header "Deliver to"
 * pill (re-opening to change). Mirrors mobile spec §3.3 and §3.5.
 */
export function LocationSheet({ open, onClose }: LocationSheetProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useT();
  const current = useAppSelector((s) => s.location);
  const activeRegions = useAppSelector((s) => s.location.activeRegions);
  const user = useAppSelector((s) => s.auth.user);
  const [country, setSelectedCountry] = useState<CountryCode>(current.country);
  const [city, setSelectedCity] = useState<string>(current.city);
  const def = getCountry(country);
  // Only offer countries the admin hasn't hidden. `current.country` is kept
  // valid by `setActiveRegions`'s correction logic, so it's always among these
  // (or this list has exactly one entry) — no extra fallback needed here.
  const selectableCountries = COUNTRIES.filter((c) =>
    activeRegions.some((r) => r.country === c.code)
  );
  const showCountryStep = selectableCountries.length > 1;

  const handleSave = () => {
    const finalCity = (def.cities as readonly string[]).includes(city)
      ? city
      : def.defaultCity;
    const countryChanged = country !== current.country;
    dispatch(setLocation({ country, city: finalCity }));
    if (user) {
      profileApi
        .setAddress({ addressCountry: country, addressCity: finalCity })
        .catch(() => {});
    }
    onClose();
    if (countryChanged) {
      // Region (and therefore catalog visibility + currency) changed — refresh
      // server-rendered data (home, shop, PDP) and drop client-side caches
      // (cart, product lists, promo codes) so they refetch with the new
      // X-Region header instead of showing the previous region's content.
      router.refresh();
      queryClient.invalidateQueries();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("location.title")}
      description={t("location.body")}
      size="sm"
    >
      <div className="flex flex-col gap-7">
        {showCountryStep && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              {t("location.country")}
            </legend>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label={t("location.country")}
            >
              {selectableCountries.map((c) => {
                const Flag = FLAGS[c.code];
                const selected = country === c.code;
                return (
                  <OptionRow
                    key={c.code}
                    selected={selected}
                    onClick={() => {
                      setSelectedCountry(c.code);
                      setSelectedCity(c.defaultCity);
                    }}
                    label={c.name}
                    sublabel={c.currency}
                    leading={
                      <span className="inline-flex h-8 w-11 shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-ink-900/10">
                        <Flag className="h-full w-full object-cover" title={c.name} />
                      </span>
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            {t("location.city")}
          </legend>
          <div
            className="flex flex-col gap-2"
            role="radiogroup"
            aria-label={t("location.city")}
          >
            {def.cities.map((c) => (
              <OptionRow
                key={c}
                selected={city === c}
                onClick={() => setSelectedCity(c)}
                label={c}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleSave}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
