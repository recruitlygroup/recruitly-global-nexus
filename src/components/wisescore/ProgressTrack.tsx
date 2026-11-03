// Gamified progress bar: the cat runs along the track as the student advances; colour shifts orange → amber → green.
import { motion } from "framer-motion";
import { Flag, PawPrint, Zap } from "lucide-react";
import { CatRunner } from "./Mascot";

const MILESTONES = [25, 50, 75, 100];
const hsl = (p: number) => `hsl(${Math.round(16 + (p / 100) * 126)} 92% ${p < 40 ? 56 : 48}%)`;

interface Props { percent: number; step: number; total: number; xp: number }

export const ProgressTrack = ({ percent, step, total, xp }: Props) => {
  const p = Math.max(0, Math.min(100, percent));
  const color = hsl(p);
  return (
    <div className="rounded-2xl bg-[hsl(var(--ink))] p-4 sm:p-5 text-white shadow-lg ring-1 ring-white/10" role="group" aria-label="WiseScore progress">
      <div className="mb-3 flex items-center justify-between gap-3">
        <motion.span key={Math.round(p)} initial={{ scale: 0.85, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }}
          className="rounded-full px-3 py-1 text-sm sm:text-base font-extrabold text-[hsl(var(--ink))]" style={{ backgroundColor: color }}>
          {Math.round(p)}% Complete
        </motion.span>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white/80">
          <span className="hidden sm:inline">Step {Math.min(step + 1, total)} of {total}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[hsl(var(--amber))]">
            <Zap className="h-3.5 w-3.5" aria-hidden /> {xp} XP
          </span>
        </div>
      </div>

      {/* running cat + track */}
      <div className="relative pt-9 sm:pt-11">
        <motion.div className="absolute top-0 z-10 w-14 sm:w-[72px] -translate-x-1/2" initial={false}
          animate={{ left: `${Math.max(6, Math.min(94, p))}%` }} transition={{ type: "spring", stiffness: 70, damping: 16 }}>
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
            <CatRunner running={p < 100} />
          </motion.div>
        </motion.div>

        <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
          <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${p}%`, backgroundColor: color }}
            transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="h-full w-full rounded-full bg-gradient-to-b from-white/35 to-transparent" />
          </motion.div>
        </div>

        {/* milestone paws */}
        <div className="relative mt-2 h-8" aria-hidden>
          {MILESTONES.map((m) => {
            const reached = p >= m;
            return (
              <div key={m} className="absolute -translate-x-1/2 text-center" style={{ left: `${m === 100 ? 96 : m}%` }}>
                <div className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-500 ${reached ? "bg-[hsl(var(--amber))] text-[hsl(var(--ink))]" : "bg-white/15 text-white/50"}`}>
                  {m === 100 ? <Flag className="h-3 w-3" /> : <PawPrint className="h-3 w-3" />}
                </div>
                <span className={`text-[10px] font-semibold ${reached ? "text-white" : "text-white/50"}`}>{m}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
