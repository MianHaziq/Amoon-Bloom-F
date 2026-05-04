import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:5000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Amoonis Boutique"),
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
  console.error(
    "Invalid client env vars:",
    z.treeifyError(parsed.error)
  );
  throw new Error("Invalid client environment configuration");
}

export const env = parsed.data;
export type ClientEnv = typeof env;
