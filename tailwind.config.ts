// tailwind.config.ts — REPLACE existing file
// FIXES:
// 1. content: fixed to src/**/*.{ts,tsx} only — eliminates scanning non-existent paths
//    that bloat build time and can include unused classes from node_modules
// 2. Added custom animation for auth page fade-in (replaces framer-motion)
// 3. Design tokens aligned with new index.css variables

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  // ── FIXED: only scan actual source files ────────────────────────────────
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        wider:   "0.05em",
        widest:  "0.15em",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 8px)",
      },
      boxShadow: {
        "card":      "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover":"0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "popover":   "0 10px 38px -10px rgb(0 0 0 / 0.35), 0 10px 20px -15px rgb(0 0 0 / 0.20)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.25s ease forwards",
        "slide-up":       "slide-up 0.3s ease forwards",
        "scale-in":       "scale-in 0.2s ease forwards",
      },
      // ── Blog article typography ──────────────────────────────────────
      // Tokenized so it always matches the site theme (light/dark) and
      // renders consistently no matter how long/short a post is or
      // whether it has images — every rule below is driven by the
      // markdown structure itself, not by per-post markup.
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body":            "hsl(var(--foreground) / 0.85)",
            "--tw-prose-headings":        "hsl(var(--foreground))",
            "--tw-prose-lead":            "hsl(var(--muted-foreground))",
            "--tw-prose-links":           "hsl(var(--primary))",
            "--tw-prose-bold":            "hsl(var(--foreground))",
            "--tw-prose-counters":        "hsl(var(--muted-foreground))",
            "--tw-prose-bullets":         "hsl(var(--muted-foreground))",
            "--tw-prose-hr":              "hsl(var(--border))",
            "--tw-prose-quotes":          "hsl(var(--foreground))",
            "--tw-prose-quote-borders":   "hsl(var(--primary))",
            "--tw-prose-captions":        "hsl(var(--muted-foreground))",
            "--tw-prose-code":            "hsl(var(--foreground))",
            "--tw-prose-pre-code":        "hsl(var(--secondary-foreground))",
            "--tw-prose-pre-bg":          "hsl(var(--secondary))",
            "--tw-prose-th-borders":      "hsl(var(--border))",
            "--tw-prose-td-borders":      "hsl(var(--border))",

            maxWidth: "none",
            fontSize: "1.0625rem",
            lineHeight: "1.8",

            p: { marginTop: "1.4em", marginBottom: "1.4em" },

            "h1, h2, h3, h4": {
              fontWeight: "700",
              letterSpacing: "-0.01em",
              scrollMarginTop: "6rem",
            },
            h1: { fontSize: "2rem", marginTop: "0", marginBottom: "0.9em" },
            h2: { fontSize: "1.5rem", marginTop: "2.2em", marginBottom: "0.8em" },
            h3: { fontSize: "1.25rem", marginTop: "1.8em", marginBottom: "0.6em" },
            h4: { fontSize: "1.0625rem", marginTop: "1.6em", marginBottom: "0.5em" },

            a: {
              fontWeight: "500",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: "hsl(var(--primary) / 0.35)",
              transition: "text-decoration-color 0.15s ease",
            },
            "a:hover": { textDecorationColor: "hsl(var(--primary))" },

            "ul, ol": { marginTop: "1.2em", marginBottom: "1.2em", paddingLeft: "1.4em" },
            li: { marginTop: "0.4em", marginBottom: "0.4em" },
            "li::marker": { color: "hsl(var(--muted-foreground))" },
            "li > p": { marginTop: "0.5em", marginBottom: "0.5em" },

            strong: { fontWeight: "600" },

            blockquote: {
              fontWeight: "500",
              fontStyle: "normal",
              borderLeftWidth: "3px",
              paddingLeft: "1.2em",
              color: "hsl(var(--foreground) / 0.85)",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },

            "code::before": { content: "none" },
            "code::after": { content: "none" },
            code: {
              backgroundColor: "hsl(var(--secondary))",
              borderRadius: "0.35em",
              padding: "0.2em 0.45em",
              fontWeight: "500",
              fontSize: "0.875em",
            },
            pre: {
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
            },
            "pre code": { backgroundColor: "transparent", padding: 0 },

            "img, figure": {
              marginTop: "2em",
              marginBottom: "2em",
              borderRadius: theme("borderRadius.xl"),
            },
            img: {
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
            },
            figcaption: {
              textAlign: "center",
              fontSize: "0.875em",
              marginTop: "0.75em",
            },

            hr: { marginTop: "3em", marginBottom: "3em" },

            table: { fontSize: "0.9375em" },
            "thead th": { fontWeight: "600" },

            "h2 + h3": { marginTop: "0.8em" },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
