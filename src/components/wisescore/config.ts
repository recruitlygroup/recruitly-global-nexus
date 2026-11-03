// WiseScore shared contact config. Same WhatsApp number / inbox already used across the site.
export const WHATSAPP_NUMBER = "9779743208282";
export const DOCS_EMAIL = "info@recruitlygroup.com";

export const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const mailtoLink = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
