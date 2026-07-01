import { z } from "zod";
import type { MessageKey } from "@/i18n";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

/**
 * Schema factories so validation messages localize. Build inside a component
 * with `useMemo(() => makeLoginSchema(t), [t])` — the message text then follows
 * the active locale (Arabic/English).
 */
export function makeLoginSchema(t: TFn) {
  return z.object({
    email: z.string().email(t("validation.email")),
    password: z.string().min(8, t("validation.passwordMin8")),
  });
}

export function makeRegisterSchema(t: TFn) {
  return makeLoginSchema(t).extend({
    name: z.string().min(2, t("validation.nameRequired")),
  });
}

export type LoginInput = z.infer<ReturnType<typeof makeLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof makeRegisterSchema>>;
