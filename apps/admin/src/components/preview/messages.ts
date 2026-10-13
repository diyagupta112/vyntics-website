import { isObject, validSnapshot, type PreviewSnapshot } from "./snapshot";
export type PreviewMessage = { type: "vyntics-preview/ready" | "vyntics-preview/rendered" | "vyntics-preview/error" | "vyntics-preview/close"; instanceId: string }
  | { type: "vyntics-preview/snapshot"; instanceId: string; snapshot: PreviewSnapshot };
export function validInstance(id: unknown): id is string { return typeof id === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(id); }
export function trustedMessage(event: MessageEvent, source: Window | null, origin: string, instanceId: string): event is MessageEvent<PreviewMessage> {
  if (!source || event.source !== source || event.origin !== origin || !isObject(event.data) || event.data.instanceId !== instanceId || !validInstance(instanceId)) return false;
  if (event.data.type === "vyntics-preview/snapshot") return validSnapshot(event.data.snapshot);
  return ["vyntics-preview/ready", "vyntics-preview/rendered", "vyntics-preview/error", "vyntics-preview/close"].includes(String(event.data.type));
}
