// WhatsApp *Channel* link for CEE updates. Set VITE_WHATSAPP_CHANNEL_URL (e.g. https://whatsapp.com/channel/XXXXXXXX).
//
// Privacy guard: a chat.whatsapp.com link is a GROUP invite, where every member can see every other member's phone number.
// For students/parents we only expose Channels (followers stay anonymous), so group links are ignored on purpose.
const raw = (import.meta.env.VITE_WHATSAPP_CHANNEL_URL as string | undefined)?.trim() ?? "";

export const WHATSAPP_CHANNEL_URL: string | null = /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9_-]+\/?$/.test(raw) ? raw : null;

if (raw && !WHATSAPP_CHANNEL_URL && typeof console !== "undefined") {
  console.warn("VITE_WHATSAPP_CHANNEL_URL ignored: it must be a WhatsApp Channel link (whatsapp.com/channel/...), not a group invite.");
}
