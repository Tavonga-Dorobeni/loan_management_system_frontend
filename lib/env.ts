import { z } from "zod";

const PublicEnv = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_USE_MOCKS: z.enum(["0", "1"]).default("0"),
});

const parsed = PublicEnv.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public env:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

export const env = parsed.data;
export const useMocks = env.NEXT_PUBLIC_USE_MOCKS === "1";
