import { z } from "zod";

/**
 * Validated public environment variables. Server-only variables should live in
 * a separate `server.env.ts` and never be imported from client components.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("http://localhost:5000/api/v1"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Amoon Bloom"),
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

if (!parsed.success) {
  console.warn(
    "[env] Invalid public env, falling back to defaults:",
    parsed.error.flatten().fieldErrors
  );
}

export const env = parsed.success ? parsed.data : clientEnvSchema.parse({});
export type ClientEnv = typeof env;
