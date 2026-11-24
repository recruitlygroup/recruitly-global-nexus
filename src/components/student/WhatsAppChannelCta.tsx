// "Follow our WhatsApp Channel" call-to-action. Renders nothing until a valid Channel link is configured.
import { MessageCircle } from "lucide-react";
import { WHATSAPP_CHANNEL_URL } from "@/lib/whatsappChannel";
import { track } from "@/lib/track";

const COPY = {
  en: { title: "Get CEE updates on WhatsApp", body: "Cut-off news, deadlines, new college lists and scam warnings, free. Channels are one-way, so your number stays private.", btn: "Follow our WhatsApp Channel" },
  ne: { title: "सीईई अपडेट ह्वाट्सएपमा पाउनुहोस्", body: "कट-अफ समाचार, अन्तिम मिति, नयाँ कलेज सूची र ठगीबारे चेतावनी, निःशुल्क। च्यानल एकतर्फी हुने भएकाले तपाईंको नम्बर गोप्य रहन्छ।", btn: "ह्वाट्सएप च्यानल फलो गर्नुहोस्" },
};

const WhatsAppChannelCta = ({ lang = "en", placement }: { lang?: "en" | "ne"; placement: string }) => {
  if (!WHATSAPP_CHANNEL_URL) return null;
  const c = COPY[lang];
  return (
    <div className="rounded-md border border-green-600/40 bg-green-50 p-5 print:hidden">
      <p className="font-bold text-green-900">{c.title}</p>
      <p className="text-sm text-green-900/90 mt-1 max-w-2xl">{c.body}</p>
      <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_channel_click", { placement, lang })}
        className="inline-flex items-center gap-2 mt-3 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-md text-sm">
        <MessageCircle className="w-4 h-4" aria-hidden="true" /> {c.btn}
      </a>
    </div>
  );
};

export default WhatsAppChannelCta;
