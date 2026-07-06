/** Which client a banner targets. MOBILE (default) is what the Flutter app shows;
 * WEB banners (including hero videos) are served only to the website. */
export type BannerPlatform = "MOBILE" | "WEB";

/** How the banner should be rendered on the storefront (derived from the URL). */
export type BannerMediaKind = "image" | "video";

export interface ApiBanner {
  id: string;
  url: string;
  sortOrder: number;
  /** Present on staff reads; storefront only ever receives PUBLISHED. */
  status?: "DRAFT" | "PUBLISHED";
  /** Target client. Optional for backward compatibility; defaults to MOBILE server-side. */
  platform?: BannerPlatform;
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
}
