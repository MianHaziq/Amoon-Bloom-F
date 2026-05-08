"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { CheckIcon, PinIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLocation } from "@/store/slices/location.slice";
import { COUNTRIES, type CountryCode, getCountry } from "@/features/location/data";

interface LocationSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Two-step modal that captures delivery country + city. Used both for the
 * onboarding gate (when `hasChosen` is false) and the header "Deliver to"
 * pill (re-opening to change). Mirrors mobile spec §3.3 and §3.5.
 */
export function LocationSheet({ open, onClose }: LocationSheetProps) {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.location);
  const [country, setSelectedCountry] = useState<CountryCode>(current.country);
  const [city, setSelectedCity] = useState<string>(current.city);
  const def = getCountry(country);

  const handleSave = () => {
    const finalCity = (def.cities as readonly string[]).includes(city)
      ? city
      : def.defaultCity;
    dispatch(setLocation({ country, city: finalCity }));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Where are we delivering?"
      description="We'll show you prices and same-day cutoff for this city."
      size="sm"
    >
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Country
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(c.code);
                  setSelectedCity(c.defaultCity);
                }}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors",
                  country === c.code
                    ? "border-bloom-500 bg-bloom-50"
                    : "border-ink-200 hover:border-ink-300"
                )}
                aria-pressed={country === c.code}
              >
                <span className="text-2xl leading-none">{c.flag}</span>
                <span className="text-sm font-medium text-ink-900">{c.name}</span>
                <span className="text-xs text-ink-500">{c.currency}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            City
          </legend>
          <ul className="flex flex-col gap-1">
            {def.cities.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setSelectedCity(c)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    city === c
                      ? "border-bloom-500 bg-bloom-50 text-bloom-700"
                      : "border-ink-200 hover:border-ink-300"
                  )}
                  aria-pressed={city === c}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-900">
                    <PinIcon size={14} className="text-ink-400" />
                    {c}
                  </span>
                  {city === c ? <CheckIcon size={14} /> : null}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
