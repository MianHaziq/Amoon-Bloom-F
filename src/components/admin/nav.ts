import {
  DashboardIcon,
  BoxIcon,
  TagIcon,
  DocumentIcon,
  UsersIcon,
  TicketIcon,
  LayersIcon,
  ImageIcon,
  ChatIcon,
  SettingsIcon,
  ChartIcon,
  GlobeIcon,
  BellIcon,
  PercentIcon,
  StarIcon,
  PinIcon,
} from "@/components/icons";
import type { ManagerPermission } from "@/features/users/types";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface AdminNavItem {
  label: string;
  href: string;
  icon: IconComponent;
  /**
   * If set, MANAGER users must have this permission to see the link. Admins
   * see everything regardless. The dashboard and analytics use the looser
   * `permissionAny` field below.
   */
  permission?: ManagerPermission;
  /** Manager passes if they have ANY of these permissions. */
  permissionAny?: ManagerPermission[];
}

export interface AdminNavGroup {
  label?: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: DashboardIcon },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: ChartIcon,
        permission: "ANALYTICS",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: BoxIcon,
        permission: "PRODUCTS",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: TagIcon,
        permission: "CATEGORIES",
      },
      {
        label: "Sections",
        href: "/admin/sections",
        icon: LayersIcon,
        permission: "SECTIONS",
      },
      {
        label: "Banners",
        href: "/admin/banners",
        icon: ImageIcon,
        permission: "BANNERS",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: StarIcon,
        permission: "REVIEWS",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: DocumentIcon,
        permission: "ORDERS",
      },
      {
        label: "Promo codes",
        href: "/admin/promo-codes",
        icon: TicketIcon,
        permission: "PROMO_CODES",
      },
      {
        label: "Tax (VAT)",
        href: "/admin/tax",
        icon: PercentIcon,
        permission: "SETTINGS",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Users", href: "/admin/users", icon: UsersIcon },
      {
        label: "Regions",
        href: "/admin/regions",
        icon: GlobeIcon,
        permission: "REGIONS",
      },
      {
        label: "Delivery zones",
        href: "/admin/delivery-zones",
        icon: PinIcon,
        permission: "DELIVERY_ZONES",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: BellIcon,
        permissionAny: ["SETTINGS", "ORDERS"],
      },
      {
        label: "Contact messages",
        href: "/admin/contact",
        icon: ChatIcon,
        permission: "CONTACT",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: SettingsIcon,
        permission: "SETTINGS",
      },
    ],
  },
];

/**
 * Filters the nav based on the user's role and permissions. Admins see all
 * items; managers see only items whose `permission` they hold (or which have
 * no permission requirement). The Users page is admin-only.
 */
export function filterNavForUser(
  groups: AdminNavGroup[],
  role: string | undefined,
  permissions: ManagerPermission[] = []
): AdminNavGroup[] {
  if (role === "ADMIN") return groups;
  if (role !== "MANAGER") return [];
  const set = new Set(permissions);
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === "/admin/users") return false;
        if (item.permission) return set.has(item.permission);
        if (item.permissionAny) return item.permissionAny.some((p) => set.has(p));
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
}
