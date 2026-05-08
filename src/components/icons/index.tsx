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

export const ChevronDown = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="m6 9 6 6 6-6" />
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

export const InstagramIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const TikTokIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
  </svg>
);

export const WhatsAppIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M21 12a9 9 0 0 1-13.7 7.7L3 21l1.4-4.2A9 9 0 1 1 21 12Z" />
    <path d="M9 9.5c0-.5.4-1 1-1h.6c.3 0 .6.2.7.5l.5 1.4-1 .8a5.5 5.5 0 0 0 2.5 2.5l.8-1 1.4.5c.3.1.5.4.5.7v.6c0 .6-.5 1-1 1A6.5 6.5 0 0 1 9 9.5Z" />
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

export const FilterIcon = ({ size, ...rest }: IconProps) => (
  <svg {...base(size)} {...rest}>
    <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />
  </svg>
);
