import { TextEncoder, TextDecoder } from "util";
import { TransformStream, ReadableStream, WritableStream } from "stream/web";
import { BroadcastChannel } from "worker_threads";

if (typeof globalThis.TextEncoder === "undefined") {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
    TextDecoder as unknown as typeof globalThis.TextDecoder;
}
if (typeof globalThis.TransformStream === "undefined") {
  (globalThis as unknown as { TransformStream: unknown }).TransformStream = TransformStream;
}
if (typeof globalThis.ReadableStream === "undefined") {
  (globalThis as unknown as { ReadableStream: unknown }).ReadableStream = ReadableStream;
}
if (typeof globalThis.WritableStream === "undefined") {
  (globalThis as unknown as { WritableStream: unknown }).WritableStream = WritableStream;
}
if (typeof globalThis.BroadcastChannel === "undefined") {
  (globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel = BroadcastChannel;
}

process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";
process.env.NEXT_PUBLIC_USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS ?? "1";

import "whatwg-fetch";
