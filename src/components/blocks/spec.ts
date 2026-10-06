// Page content model. Every content page in the site is described by one PageSpec (see src/data/pages/*).
import type { IconName } from "./icons";

export interface Cta { label: string; to?: string; href?: string }
export interface FlowNode {
  title: string; body?: string; icon?: IconName;
  /** "decision" renders a question node; "end" a terminal node; "partner" is highlighted amber. */
  kind?: "step" | "decision" | "end" | "partner";
  tag?: string;
  /** Optional side path under the node, e.g. { label: "No", text: "Join a Rubisco training course" }. */
  branch?: { label: string; text: string };
}
export interface Step { title: string; body: string; tag?: string; icon?: IconName; bullets?: string[] }
export interface Partner { name: string; role: string; body: string; href: string; icon: IconName; points: string[] }

export interface PageSpec {
  seo: { title: string; description: string };
  hero: {
    eyebrow?: string; title: string; lead: string; primary: Cta; secondary?: Cta;
    journey?: { title?: string; steps: string[] };
  };
  notice?: { tone: "info" | "warning"; title: string; body: string };
  stats?: { value: string; label: string }[];
  intro?: { title: string; paragraphs: string[]; aside?: { title: string; items: string[] } };
  features?: { title: string; lead?: string; cols?: 2 | 3 | 4; items: { icon: IconName; title: string; body: string }[] };
  flow?: { title: string; lead?: string; nodes: FlowNode[] };
  partners?: { title: string; lead?: string; items: Partner[] };
  timeline?: { title: string; lead?: string; steps: Step[] };
  checklists?: { title: string; lead?: string; groups: { title: string; items: string[] }[] };
  comparison?: { title: string; lead?: string; columns: string[]; highlight?: number; rows: { label: string; cells: (string | boolean)[] }[] };
  apply?: boolean;
  employerCta?: boolean;
  faqs?: { title?: string; items: { q: string; a: string }[] };
  related?: { title: string; items: { label: string; body?: string; to: string }[] };
  closing?: { title: string; body: string; primary?: Cta };
}
