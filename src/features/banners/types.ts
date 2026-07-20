/** Which client a banner targets. MOBILE (default) is what the Flutter app shows;
 * WEB banners (including hero videos) are served only to the website. */
export type BannerPlatform = "MOBILE" | "WEB";

/** How the banner should be rendered on the storefront (derived from the URL). */
export type BannerMediaKind = "image" | "video";

export interface ApiBannerRegion {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
}

export interface ApiBanner {
  id: string;
  url: string;
  sortOrder: number;
  /** Present on staff reads; storefront only ever receives PUBLISHED. */
  status?: "DRAFT" | "PUBLISHED";
  /** Target client. Optional for backward compatibility; defaults to MOBILE server-side. */
  platform?: BannerPlatform;
  /** Regions this banner is visible in. Present on staff reads. */
  regions?: ApiBannerRegion[];
  /** Same data as `regions`, flattened to ids — convenient for the admin edit form. */
  regionIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiBannerCreateInput {
  /** Either `url` for a single banner or `urls` for batch insert. */
  url?: string;
  urls?: string[];
  /** Target client. Defaults to MOBILE on the server when omitted. */
  platform?: BannerPlatform;
  /** Publish state. Admin uploads default to PUBLISHED so banners appear immediately. */
  status?: "DRAFT" | "PUBLISHED";
  /** Regions to show this banner in. Omitted/empty defaults to the default region only. */
  regionIds?: string[];
}

export interface ApiBannerUpdateInput {
  platform?: BannerPlatform;
  status?: "DRAFT" | "PUBLISHED";
  /** Full replace of the banner's region set. */
  regionIds?: string[];
}
