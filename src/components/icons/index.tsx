/**
 * Lightweight inline SVG icons. We avoid external icon libraries to keep the
 * bundle small and the visual style fully controlled (1.5px stroke, rounded
 * caps, currentColor).
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const SearchIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** Magnifying glass with a plus — the "hover/tap to zoom" affordance (distinct from SearchIcon). */
export const ZoomInIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="11" cy="11" r="7" />
    <path d="M11 8v6M8 11h6" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const BagIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const HeartIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 20s-7-4.35-9-9.21A4.79 4.79 0 0 1 7.5 5.5 4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 4.5-2.5A4.79 4.79 0 0 1 21 10.79C19 15.65 12 20 12 20Z" />
  </svg>
);

export const UserIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const MenuIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

/** Boxed package — the "my orders" affordance. */
export const PackageIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
    <path d="M16.5 5.5 7.5 10.5" />
  </svg>
);

/** Enter/arrow-into-door — the "sign in" affordance. */
export const LoginIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5M15 12H3" />
  </svg>
);

/** Person with a plus — the "create account" affordance. */
export const UserPlusIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 21a6 6 0 0 1 12 0" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);

/** Storefront awning — the "back to store" affordance. */
export const StoreIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
    <path d="M3 9l1.5-5h15L21 9a2.5 2.5 0 0 1-4.5 1.5 2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 9Z" />
    <path d="M9 20v-5h6v5" />
  </svg>
);

export const CloseIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);

export const ChevronRight = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ChevronLeft = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const ChevronDown = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** Drag handle — six dots, the standard "grab to reorder" affordance. */
export const GripVerticalIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...rest}>
    <circle cx="9" cy="6" r="1.4" />
    <circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" />
    <circle cx="15" cy="18" r="1.4" />
  </svg>
);

export const ArrowRight = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const TruckIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </svg>
);

export const ShieldIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const SparkleIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5 8 16M16 8l2.5-2.5" />
  </svg>
);

export const PinIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const MailIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const PhoneIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const StarIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest} fill="currentColor" stroke="none">
    <path d="m12 17.3-5.5 3.2 1.5-6.2L3 9.9l6.3-.5L12 3.5l2.7 5.9 6.3.5-5 4.4 1.5 6.2Z" />
  </svg>
);

/** Official brand glyphs below (filled), not the generic stroke set — needed for recognisability. */
export const InstagramIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={(size * 448) / 512}
    height={size}
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
  </svg>
);

export const TikTokIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={(size * 448) / 512}
    height={size}
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
  </svg>
);

export const FacebookIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={(size * 320) / 512}
    height={size}
    viewBox="0 0 320 512"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
  </svg>
);

export const ThreadsIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={(size * 448) / 512}
    height={size}
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M331.5 235.7c2.2 .9 4.2 1.9 6.3 2.8c29.2 14.1 50.6 35.2 61.8 61.4c15.7 36.5 17.2 95.8-30.3 143.2c-36.2 36.2-80.3 52.5-142.6 53h-.3c-70.2-.5-124.1-24.1-160.4-70.2c-32.3-41-49-97.7-49.7-168.5V257v-.2c.7-70.8 17.4-127.5 49.7-168.5C102.4 42.1 156.3 18.5 226.5 18h.3c70.3 .5 124.9 24 162.3 69.9c18.4 22.7 32 50 40.6 81.7l-40.4 10.8c-7.1-25.8-17.8-47.8-32.2-65.4c-29.2-35.8-73-54.2-130.5-54.6c-57 .5-100.1 18.8-128.2 54.4C69.9 146.9 56.2 196.8 55.7 257c.5 60.2 14.2 110.1 40.7 143.3c28 35.6 71.2 53.9 128.2 54.4c51.4-.4 85.4-12.6 113.7-40.9c32.3-32.2 31.7-71.8 21.4-95.9c-6.1-14.2-17.1-26-31.9-34.9c-3.7 26.9-11.8 48.3-24.7 64.8c-17.1 21.8-41.4 33.6-72.7 35.3c-23.6 1.3-46.3-4.4-63.9-16c-20.8-13.8-33-34.8-34.3-59.3c-2.5-48.3 35.7-83 95.2-86.4c21.1-1.2 40.9-.3 59.2 2.8c-2.4-14.8-7.3-26.6-14.6-35.2c-10-11.7-25.6-17.7-46.2-17.8H215c-16.6 0-39 4.6-53.3 26.3l-34.4-23.6c19.2-29.1 50.3-45.1 87.8-45.1h.8c62.6 .4 99.9 39.5 103.7 107.7l-.2 .2zm-156 68.8c1.3 25.1 28.4 36.8 54.6 35.3c25.6-1.4 54.6-11.4 59.5-73.2c-13.2-2.9-27.8-4.4-43.4-4.4c-4.8 0-9.6 .1-14.4 .4c-42.9 2.4-57.2 23.2-56.2 41.9z" />
  </svg>
);

/** Official WhatsApp glyph (filled), not the generic stroke set — needed for brand recognisability. */
export const WhatsAppIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={(size * 448) / 512}
    height={size}
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

export const PlusIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 12h14" />
  </svg>
);

export const TrashIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </svg>
);

export const CheckIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const CheckCircleIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

export const AlertIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </svg>
);

// --- Admin icons ---

export const DashboardIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const BoxIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 7l9-4 9 4-9 4-9-4Z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

export const TagIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
    <circle cx="8" cy="8" r="1.5" />
  </svg>
);

export const DocumentIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
    <path d="M14 3v6h6" />
    <path d="M9 14h6M9 18h6" />
  </svg>
);

export const UsersIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 21a6 6 0 0 1 12 0" />
    <circle cx="17" cy="9" r="3" />
    <path d="M15 21a5 5 0 0 1 7-4.5" />
  </svg>
);

export const TicketIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
    <path d="M10 6v12" strokeDasharray="2 3" />
  </svg>
);

export const LayersIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </svg>
);

export const ImageIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5-7 7" />
  </svg>
);

export const ChatIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 12a8 8 0 0 1-12.5 6.6L3 21l1.4-4.2A8 8 0 1 1 21 12Z" />
    <path d="M8 11h8M8 14h5" />
  </svg>
);

export const SettingsIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

export const ChartIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 3v18h18" />
    <path d="M7 15l3-4 3 3 4-7" />
  </svg>
);

export const LogoutIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

/** Percent sign — tax / VAT rate affordance. */
export const PercentIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M19 5 5 19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export const PencilIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const EyeIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M17.9 17.9A18 18 0 0 1 12 19C5.5 19 2 12 2 12a17.8 17.8 0 0 1 4.1-5.9M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-2.4 3.5" />
    <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
    <path d="M2 2l20 20" />
  </svg>
);

export const FilterIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />
  </svg>
);

export const GlobeIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
  </svg>
);

export const BellIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const DownloadIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 4v11" />
    <path d="m7.5 11 4.5 4.5 4.5-4.5" />
    <path d="M5 19h14" />
  </svg>
);

export const ChevronDownIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CalendarIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const SpreadsheetIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10" />
  </svg>
);

/**
 * Currency signs — filled glyph marks (not stroke icons), traced directly from
 * official sources so they render pixel-accurately rather than approximating
 * or depending on OS/browser Unicode font support (neither sign has shipped
 * in any system font as of 2026):
 *   - Dirham (AED): CBUAE "Dirham Currency Symbol Guideline" v1.0 (official
 *     vector artwork, page 9 — Unicode U+20C3, accepted for Unicode 18.0).
 *   - Riyal (SAR): SAMA's official symbol SVG (sama.gov.sa/.../Guideline.aspx
 *     — Unicode U+20C1, ratified in Unicode 17.0).
 * Sized in `em` by default so they scale with whatever text they sit next to,
 * with no per-call-site size tuning needed. `currentColor` fill inherits the
 * surrounding text color (e.g. the pink price text).
 */
type CurrencySignProps = SVGProps<SVGSVGElement> & { size?: number | string };

export const DirhamSign = ({ size = "1em", style, ...rest }: CurrencySignProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 384.53 334.44"
    fill="currentColor"
    aria-hidden
    style={{ display: "inline-block", verticalAlign: "-0.05em", ...style }}
    {...rest}
  >
    <path
      fillRule="evenodd"
      d="M 381.52 157.18 L 384.53 160.02 L 384.53 151.41 C 384.53 132.45 371.24 117.02 354.91 117.02 L 328.81 117.03 C 310.55 40.93 248.32 0.00 155.76 0.00 C 96.81 0.00 89.24 0.00 33.42 0.00 C 33.42 0.00 50.18 14.09 50.18 58.44 L 50.18 117.06 L 19.31 117.07 C 13.31 117.07 7.68 114.75 3.01 110.36 L 0.00 107.53 L 0.00 116.14 C 0.00 135.10 13.29 150.53 29.62 150.53 L 50.18 150.52 L 50.18 183.96 L 19.31 183.97 C 13.31 183.97 7.68 181.65 3.01 177.27 L 0.00 174.43 L 0.00 183.03 C 0.00 201.99 13.29 217.41 29.62 217.41 L 50.18 217.40 L 50.18 278.61 C 50.18 321.71 33.42 334.43 33.42 334.43 L 155.76 334.44 C 251.23 334.44 311.47 293.22 329.03 217.37 L 365.22 217.36 C 371.22 217.36 376.85 219.68 381.52 224.06 L 384.53 226.90 L 384.53 218.29 C 384.53 199.34 371.24 183.92 354.91 183.92 L 333.84 183.92 C 334.20 178.48 334.39 172.91 334.39 167.20 C 334.39 161.49 334.19 155.92 333.81 150.48 L 365.22 150.48 C 371.22 150.48 376.85 152.80 381.52 157.18 Z M 100.31 16.74 L 151.45 16.74 C 220.25 16.74 260.10 47.22 272.00 117.04 L 100.31 117.06 L 100.31 16.74 Z M 151.89 317.73 L 100.31 317.73 L 100.31 217.40 L 271.89 217.37 C 260.77 280.56 224.98 315.93 151.89 317.73 Z M 275.81 167.22 C 275.81 172.94 275.68 178.51 275.43 183.93 L 100.31 183.96 L 100.31 150.52 L 275.43 150.49 C 275.68 155.89 275.81 161.46 275.81 167.22 Z"
    />
  </svg>
);

export const RiyalSign = ({ size = "1em", style, ...rest }: CurrencySignProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1124.14 1256.39"
    fill="currentColor"
    aria-hidden
    style={{ display: "inline-block", verticalAlign: "-0.05em", ...style }}
    {...rest}
  >
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
  </svg>
);
