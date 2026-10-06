import { ICONS, type IconName } from "./icons";
export const Icon = ({ name, className }: { name: IconName; className?: string }) => { const C = ICONS[name]; return <C aria-hidden className={className} />; };
