"use client";

/**
 * Accessible dropdown menu primitive — one implementation shared by the
 * storefront account menu and the admin profile menu (and anywhere else a
 * "click a trigger, get a menu" pattern is needed).
 *
 * What it gives you for free:
 *   • ARIA: trigger gets aria-haspopup/aria-expanded; panel is role="menu";
 *     items are role="menuitem".
 *   • Keyboard: ArrowDown/Up + Home/End roving focus, Enter/Space activates,
 *     Escape closes and restores focus to the trigger, Tab closes.
 *   • Pointer: click-outside closes.
 *   • Motion: panel scales/fades in from its anchored edge via the house motion
 *     tokens. Reduced-motion is respected globally by <MotionConfig>.
 *   • RTL: alignment is logical (start/end), so it flips with `dir`.
 *
 * Compose it:
 *   <Menu>
 *     <MenuTrigger className="...">{avatar}</MenuTrigger>
 *     <MenuContent align="end">
 *       <MenuHeader title="Layla" subtitle="layla@…" />
 *       <MenuItem href="/account" icon={<UserIcon size={16} />}>My account</MenuItem>
 *       <MenuSeparator />
 *       <MenuItem onSelect={logout} icon={<LogoutIcon size={16} />} tone="danger">
 *         Sign out
 *       </MenuItem>
 *     </MenuContent>
 *   </Menu>
 */

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

interface MenuContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  /** Open via keyboard (ArrowDown/Enter on trigger) → focus the first item. */
  openWithKeyboard: () => void;
  /** True when the menu was opened via keyboard, so we focus the first item. */
  openedByKeyboard: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  menuId: string;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`${component} must be used within <Menu>`);
  return ctx;
}

/** Move roving focus across the menu's items. */
function focusItem(panel: HTMLElement | null, index: number) {
  if (!panel) return;
  const items = Array.from(
    panel.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
  );
  if (items.length === 0) return;
  const clamped = (index + items.length) % items.length;
  items[clamped]?.focus();
}

export function Menu({
  children,
  className,
  openOnHover = false,
}: {
  children: ReactNode;
  className?: string;
  /** When true the menu opens on mouse-enter and closes on mouse-leave. */
  openOnHover?: boolean;
}) {
  const [open, setOpenState] = useState(false);
  const [openedByKeyboard, setOpenedByKeyboard] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const setOpen = useCallback((next: boolean) => {
    if (!next) setOpenedByKeyboard(false);
    setOpenState(next);
  }, []);

  const toggle = useCallback(() => {
    setOpenedByKeyboard(false);
    setOpenState((v) => !v);
  }, []);

  const openWithKeyboard = useCallback(() => {
    setOpenedByKeyboard(true);
    setOpenState(true);
  }, []);

  // Close on outside pointer + on Escape (Escape restores focus to trigger).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <MenuContext.Provider
      value={{
        open,
        setOpen,
        toggle,
        openWithKeyboard,
        openedByKeyboard,
        triggerRef,
        panelRef,
        menuId,
      }}
    >
      <div
        ref={rootRef}
        className={cn("relative", className)}
        onMouseEnter={openOnHover ? () => setOpen(true) : undefined}
        onMouseLeave={openOnHover ? () => setOpen(false) : undefined}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export function MenuTrigger({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  /** aria-label for icon-only triggers. */
  label?: string;
}) {
  const { open, toggle, openWithKeyboard, triggerRef, menuId } =
    useMenuContext("MenuTrigger");

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openWithKeyboard();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}

const ALIGN = {
  start: "start-0",
  end: "end-0",
} as const;

export function MenuContent({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: keyof typeof ALIGN;
  className?: string;
}) {
  const { open, openedByKeyboard, panelRef, triggerRef, menuId } =
    useMenuContext("MenuContent");

  // On a keyboard-initiated open, move focus into the first item.
  useEffect(() => {
    if (open && openedByKeyboard) {
      // Wait a frame so the panel has mounted.
      const id = requestAnimationFrame(() => focusItem(panelRef.current, 0));
      return () => cancelAnimationFrame(id);
    }
  }, [open, openedByKeyboard, panelRef]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])'
      ) ?? []
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(panelRef.current, current + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(panelRef.current, current - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(panelRef.current, 0);
        break;
      case "End":
        e.preventDefault();
        focusItem(panelRef.current, items.length - 1);
        break;
      case "Tab":
        // Let focus leave, but close the menu.
        setTimeout(() => triggerRef.current?.blur(), 0);
        break;
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          id={menuId}
          ref={panelRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -4 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          style={{ transformOrigin: align === "end" ? "top right" : "top left" }}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-50 min-w-56 origin-top overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-(--shadow-lift)",
            ALIGN[align],
            className
          )}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

export function MenuHeader({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 py-2.5", className)}>
      <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
      {subtitle ? (
        <p className="truncate text-xs text-ink-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("my-1.5 h-px bg-ink-100", className)}
    />
  );
}

interface MenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  /** Renders a Link when set; otherwise a button. */
  href?: string;
  onSelect?: () => void;
  /** `danger` colours the item for destructive actions (e.g. logout). */
  tone?: "default" | "danger";
  /** Trailing content (badge, count, shortcut). */
  trailing?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function MenuItem({
  children,
  icon,
  href,
  onSelect,
  tone = "default",
  trailing,
  disabled,
  className,
}: MenuItemProps) {
  const { setOpen } = useMenuContext("MenuItem");

  const handleSelect = () => {
    if (disabled) return;
    setOpen(false);
    onSelect?.();
  };

  const classes = cn(
    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-500/60",
    tone === "danger"
      ? "text-bloom-700 hover:bg-bloom-50 focus-visible:bg-bloom-50"
      : "text-ink-700 hover:bg-ink-50 hover:text-ink-900 focus-visible:bg-ink-50",
    disabled && "pointer-events-none opacity-50",
    className
  );

  const inner = (
    <>
      {icon ? (
        <span
          className={cn(
            "shrink-0 transition-colors",
            tone === "danger" ? "text-bloom-500" : "text-ink-400 group-hover:text-ink-700"
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children}</span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        onClick={handleSelect}
        className={classes}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={handleSelect}
      className={classes}
    >
      {inner}
    </button>
  );
}
