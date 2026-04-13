

## Plan: Replace AI-generated Social Proof Wall with LightWidget Instagram Embed

**What changes:**
Replace the entire `SocialProofWall.tsx` component content (fake Instagram cards with gradients, auto-scroll, like buttons, WhatsApp CTAs) with a clean section that embeds your real Instagram feed using the LightWidget widget.

**Technical details:**

1. **Rewrite `src/components/SocialProofWall.tsx`** — Replace ~537 lines with a simple component that:
   - Keeps the section header with your Instagram badge link (`@recruitlygroup`)
   - Loads the LightWidget script via `useEffect`
   - Renders the LightWidget iframe (`231726b724b65c1cbe1425aa7d74a79f`)
   - Keeps responsive padding and section styling consistent with the rest of the page

2. **No other files change** — `Index.tsx` already imports `<SocialProofWall />` in the correct position.

