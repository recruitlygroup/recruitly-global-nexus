// "Wise" — the brown tabby cat that guides students through WiseScore. Pure SVG + framer-motion (no image assets).
import { motion, useReducedMotion } from "framer-motion";

export type MascotMood = "happy" | "wave" | "think" | "wow" | "love";

const FUR = "#A8642B", FUR_DARK = "#6E3F1A", FUR_LIGHT = "#C98A4B", CREAM = "#F3D9B1", PINK = "#F2A7A0", INK = "#1B1208";

interface MascotProps { mood?: MascotMood; className?: string }

export const Mascot = ({ mood = "happy", className }: MascotProps) => {
  const still = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loop = (a: any, t: any): any => (still ? {} : { animate: a, transition: { repeat: Infinity, ...t } });

  const eyesClosedHappy = mood === "happy" || mood === "love";
  const lookAside = mood === "think";

  return (
    <svg viewBox="0 0 260 280" className={className} role="img" aria-label="Wise, the WiseScore cat mascot">
      {/* soft ground shadow */}
      <ellipse cx="130" cy="268" rx="78" ry="9" fill="#0a192f" opacity=".18" />

      {/* tail */}
      <motion.g style={{ originX: "190px", originY: "238px" }} {...loop({ rotate: [0, 10, -4, 8, 0] }, { duration: 3.2, ease: "easeInOut" })}>
        <path d="M188 240 C 238 238, 252 190, 232 160 C 224 148, 208 156, 216 170 C 228 192, 214 218, 186 222 Z" fill={FUR} stroke={FUR_DARK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M232 160 C 224 148, 208 156, 216 170 C 220 176, 226 176, 230 170 Z" fill={FUR_DARK} />
        <path d="M226 196 l-14 4 M222 212 l-14 3" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" />
      </motion.g>

      {/* body */}
      <path d="M72 262 C 56 220, 70 168, 130 160 C 190 168, 204 220, 188 262 Z" fill={FUR} stroke={FUR_DARK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="130" cy="226" rx="38" ry="38" fill={CREAM} />
      <path d="M92 190 l12 8 M168 190 l-12 8 M86 214 l14 2 M174 214 l-14 2" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" />

      {/* back paws */}
      <ellipse cx="94" cy="262" rx="22" ry="11" fill={FUR_LIGHT} stroke={FUR_DARK} strokeWidth="3" />
      <ellipse cx="166" cy="262" rx="22" ry="11" fill={FUR_LIGHT} stroke={FUR_DARK} strokeWidth="3" />

      {/* left front paw */}
      <g>
        <rect x="102" y="224" width="22" height="36" rx="11" fill={FUR} stroke={FUR_DARK} strokeWidth="3" />
        <ellipse cx="113" cy="258" rx="14" ry="8" fill={CREAM} stroke={FUR_DARK} strokeWidth="3" />
      </g>
      {/* right front paw (waves) */}
      <motion.g style={{ originX: "148px", originY: "232px" }}
        {...(mood === "wave" ? loop({ rotate: [0, -38, 0, -38, 0] }, { duration: 1.6, ease: "easeInOut", repeatDelay: 0.6 }) : {})}>
        <rect x="138" y={mood === "wave" ? 190 : 224} width="22" height={mood === "wave" ? 48 : 36} rx="11" fill={FUR} stroke={FUR_DARK} strokeWidth="3" />
        <ellipse cx="149" cy={mood === "wave" ? 192 : 258} rx="14" ry="8" fill={CREAM} stroke={FUR_DARK} strokeWidth="3" />
      </motion.g>

      {/* head group (gentle tilt) */}
      <motion.g style={{ originX: "130px", originY: "150px" }} {...loop({ rotate: lookAside ? [0, -6, 0] : [0, 2.5, -2.5, 0], y: [0, -2, 0] }, { duration: 3.6, ease: "easeInOut" })}>
        {/* ears */}
        <motion.g style={{ originX: "70px", originY: "70px" }} {...loop({ rotate: [0, -8, 0] }, { duration: 4.5, repeatDelay: 1.5 })}>
          <path d="M54 92 L58 28 L104 66 Z" fill={FUR} stroke={FUR_DARK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M66 80 L68 44 L92 68 Z" fill={PINK} />
        </motion.g>
        <path d="M206 92 L202 28 L156 66 Z" fill={FUR} stroke={FUR_DARK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M194 80 L192 44 L168 68 Z" fill={PINK} />

        {/* head */}
        <ellipse cx="130" cy="106" rx="78" ry="68" fill={FUR} stroke={FUR_DARK} strokeWidth="3" />
        {/* tabby stripes */}
        <path d="M130 44 v22 M112 48 l4 18 M148 48 l-4 18" stroke={FUR_DARK} strokeWidth="5" strokeLinecap="round" />
        <path d="M58 100 l16 3 M58 118 l16 -2 M202 100 l-16 3 M202 118 l-16 -2" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" />
        {/* muzzle */}
        <ellipse cx="130" cy="128" rx="38" ry="28" fill={CREAM} />

        {/* graduation cap — ties the cat to the education brand */}
        <g transform="rotate(-8 130 40)">
          <path d="M82 40 L130 20 L178 40 L130 60 Z" fill="#0a192f" stroke="#050d18" strokeWidth="2" strokeLinejoin="round" />
          <path d="M106 52 v14 q24 12 48 0 v-14" fill="#13294b" />
          <path d="M178 40 v22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="178" cy="66" r="5" fill="#F59E0B" />
        </g>

        {/* eyes */}
        {eyesClosedHappy ? (
          <>
            <path d="M82 96 q16 -18 32 0" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
            <path d="M146 96 q16 -18 32 0" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            {[98, 162].map((cx) => (
              <motion.g key={cx} style={{ originX: `${cx}px`, originY: "96px" }}
                {...loop({ scaleY: [1, 1, 0.08, 1, 1] }, { duration: 4.2, times: [0, 0.45, 0.5, 0.55, 1] })}>
                <ellipse cx={cx} cy="96" rx={mood === "wow" ? 17 : 14} ry={mood === "wow" ? 20 : 17} fill="#fff" stroke={INK} strokeWidth="3" />
                <circle cx={cx + (lookAside ? 6 : 0)} cy={96 + (lookAside ? -5 : 1)} r={mood === "wow" ? 10 : 9} fill="#2B7A4B" />
                <circle cx={cx + (lookAside ? 6 : 0)} cy={96 + (lookAside ? -5 : 1)} r="5" fill={INK} />
                <circle cx={cx + (lookAside ? 9 : 3)} cy={96 + (lookAside ? -9 : -4)} r="2.6" fill="#fff" />
              </motion.g>
            ))}
          </>
        )}
        {/* blush */}
        {(mood === "happy" || mood === "love") && (<><ellipse cx="78" cy="124" rx="11" ry="7" fill={PINK} opacity=".7" /><ellipse cx="182" cy="124" rx="11" ry="7" fill={PINK} opacity=".7" /></>)}

        {/* nose + mouth */}
        <path d="M120 118 h20 l-10 12 Z" fill={PINK} stroke={FUR_DARK} strokeWidth="2" strokeLinejoin="round" />
        {mood === "wow" ? (
          <ellipse cx="130" cy="148" rx="9" ry="11" fill="#7A2E2E" stroke={INK} strokeWidth="2.5" />
        ) : (
          <path d="M130 130 v6 M130 136 q-12 12 -24 2 M130 136 q12 12 24 2" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        )}
        {/* whiskers */}
        <path d="M92 130 l-40 -6 M92 138 l-42 6 M168 130 l40 -6 M168 138 l42 6" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
      </motion.g>

      {mood === "love" && !still && (
        <motion.text x="196" y="60" fontSize="30" animate={{ y: [60, 30], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>💛</motion.text>
      )}
    </svg>
  );
};

// Small side-view cat that runs along the progress bar.
export const CatRunner = ({ running = true, className }: { running?: boolean; className?: string }) => {
  const still = useReducedMotion();
  const go = running && !still;
  const leg = (x: number, delay: number) => (
    <motion.rect x={x} y="30" width="7" height="16" rx="3.5" fill={FUR_DARK} style={{ originX: `${x + 3.5}px`, originY: "30px" }}
      animate={go ? { rotate: [28, -28, 28] } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 0.5, delay, ease: "easeInOut" }} />
  );
  return (
    <svg viewBox="0 0 90 56" className={className} aria-hidden="true">
      <motion.path d="M10 28 C -6 22, -2 6, 8 8" fill="none" stroke={FUR} strokeWidth="7" strokeLinecap="round"
        style={{ originX: "12px", originY: "28px" }} animate={go ? { rotate: [-8, 10, -8] } : {}} transition={{ repeat: Infinity, duration: 0.5 }} />
      {leg(16, 0)}{leg(26, 0.25)}
      <ellipse cx="40" cy="28" rx="28" ry="14" fill={FUR} stroke={FUR_DARK} strokeWidth="2.5" />
      <ellipse cx="42" cy="34" rx="16" ry="7" fill={CREAM} />
      {leg(48, 0.25)}{leg(58, 0)}
      <circle cx="68" cy="20" r="14" fill={FUR} stroke={FUR_DARK} strokeWidth="2.5" />
      <path d="M58 11 L60 -1 L69 8 Z M77 9 L79 -1 L69 6 Z" fill={FUR} stroke={FUR_DARK} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="73" cy="19" r="2.6" fill={INK} /><circle cx="74" cy="18" r=".9" fill="#fff" />
      <path d="M80 24 l-3 1.5 h6 Z" fill={PINK} />
      <path d="M64 13 v5 M69 12 v5" stroke={FUR_DARK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
