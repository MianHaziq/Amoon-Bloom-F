"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { Modal, Button, Skeleton } from "@/components/ui";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { tapScale, popFeedback } from "@/lib/motion";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocation } from "@/store/slices/location.slice";
import { regionsApi } from "@/features/regions/api/regions.api";
import { deliveryZonesApi } from "@/features/delivery-zones/api/delivery-zones.api";
import { queryKeys } from "@/services/queryKeys";
import { profileApi } from "@/features/auth/api/profile.api";
import { useT } from "@/i18n/useT";
import { RegionFlag } from "./RegionFlag";

interface LocationSheetProps {
  open: boolean;
  onClose: () => void;
}

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
 * Two-step modal that captures delivery region + zone. Used both for the
 * onboarding gate (when `hasChosen` is false) and the header "Deliver to"
 * pill (re-opening to change). Regions and their zones are both admin-
 * managed (`GET /regions`, `GET /delivery-zones?region=`) — the same data
 * checkout's "Emirate" dropdown reads — so an admin adding/removing a region
 * or its sub-areas shows up here immediately, no code change needed.
 */
export function LocationSheet({ open, onClose }: LocationSheetProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useT();
  const current = useAppSelector((s) => s.location);
  const activeRegions = useAppSelector((s) => s.location.activeRegions);
  const user = useAppSelector((s) => s.auth.user);
  const [country, setSelectedCountry] = useState<string>(current.country);
  // Explicit user pick only (null = "hasn't touched this step yet") — the
  // effective `city` used for rendering/saving is derived below from this
  // plus the live zone list, so it's always valid without needing an effect.
  const [citySelection, setCitySelection] = useState<string | null>(current.city || null);

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => regionsApi.list(),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  // Only offer regions the admin hasn't hidden. `current.country` is kept
  // valid by `setActiveRegions`'s correction logic, so it's always among these
  // (or this list has exactly one entry) — no extra fallback needed here.
  const selectableRegions = (regionsQuery.data ?? []).filter((r) =>
    activeRegions.includes(r.code)
  );
  const showCountryStep = selectableRegions.length > 1;

  const zonesQuery = useQuery({
    queryKey: queryKeys.deliveryZones.list(country),
    queryFn: () => deliveryZonesApi.list(country),
    enabled: open && Boolean(country),
    staleTime: 5 * 60_000,
  });
  const zones = zonesQuery.data ?? [];
  // A region may legitimately have zero configured zones — the city step is
  // then skipped entirely rather than blocking Save on an empty required list
  // (mirrors CheckoutClient's zoneRequired fallback).
  const showCityStep = !zonesQuery.isPending && zones.length > 0;
  // Zones are prefetched per-region as soon as the header mounts (see
  // DeliverToPill), so this should rarely actually show — it's the fallback
  // for a cold cache (e.g. TTL expired) so switching country never looks like
  // nothing happened while the fetch is in flight.
  const showCityStepLoading = zonesQuery.isPending && Boolean(country);
  // The effective selection: the user's explicit pick if it's still valid for
  // the current zone list, otherwise the first zone stands in as a live
  // default (same intent the old static `defaultCity` served, just derived
  // from live data now instead of synced via an effect).
  const city = zones.some((z) => z.name === citySelection) ? citySelection! : zones[0]?.name ?? "";

  // Takes explicit values (not the `country`/`city` state) so a city tap can
  // commit immediately with the just-clicked zone, without waiting on a
  // re-render to see it reflected in the derived `city` value.
  const commit = (finalCountry: string, finalCity: string) => {
    const countryChanged = finalCountry !== current.country;
    dispatch(setLocation({ country: finalCountry, city: finalCity }));
    if (user) {
      profileApi
        .setAddress({ addressCountry: finalCountry, addressCity: finalCity })
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

  const handleSave = () => commit(country, city);

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
              {selectableRegions.map((r) => {
                const selected = country === r.code;
                return (
                  <OptionRow
                    key={r.code}
                    selected={selected}
                    onClick={() => {
                      setSelectedCountry(r.code);
                      setCitySelection(null);
                    }}
                    label={r.name}
                    sublabel={r.currency}
                    leading={<RegionFlag region={r} shape="circle" className="h-10 w-10" />}
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        {showCityStep && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              {t("location.city")}
            </legend>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label={t("location.city")}
            >
              {zones.map((z) => (
                <OptionRow
                  key={z.id}
                  selected={city === z.name}
                  onClick={() => {
                    // Picking a city is the final step — select and close
                    // immediately instead of requiring a separate Save tap.
                    setCitySelection(z.name);
                    commit(country, z.name);
                  }}
                  label={z.name}
                />
              ))}
            </div>
          </fieldset>
        )}

        {showCityStepLoading && (
          <fieldset className="flex flex-col gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              {t("location.city")}
            </legend>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-15 w-full rounded-2xl" />
              ))}
            </div>
          </fieldset>
        )}

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
