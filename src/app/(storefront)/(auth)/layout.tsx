import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { getServerT } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = await getServerT();
  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-2">
      {/* Form column */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Editorial column */}
      <aside className="relative hidden overflow-hidden bg-blush-50 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1400&q=85"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink-900/50 via-ink-900/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end gap-6 p-12 text-white">
          <Link
            href={ROUTES.home}
            className="font-display text-3xl font-medium tracking-tight"
          >
            <span className="text-cream-50">Amoon</span>{" "}
            <span className="text-bloom-300">Bloom</span>
          </Link>
          <p className="max-w-sm font-display text-3xl font-medium leading-snug">
            {`“${t("auth.authQuote")}”`}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">
            {siteConfig.tagline}
          </p>
        </div>
      </aside>
    </div>
  );
}
