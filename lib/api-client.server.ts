import "server-only";
import { cookies } from "next/headers";
import { setServerTokenReader } from "./api-client";

setServerTokenReader(() => cookies().get("session")?.value ?? null);

export {};
