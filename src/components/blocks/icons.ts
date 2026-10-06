// Icon registry — lets page content live in plain data files (strings) while rendering real Lucide icons.
import {
  Search, ClipboardList, FileCheck2, Stamp, GraduationCap, Plane, ShieldCheck, Users, Building2, Briefcase, Globe,
  Clock, Video, MessageCircle, Mail, Phone, MapPin, Languages, Award, HeartHandshake, Scale, Landmark, FileText,
  BadgeCheck, Wallet, Wrench, Truck, HardHat, Stethoscope, Utensils, Factory, Zap, Wheat, Milk, Handshake, Lock,
  AlertTriangle, Ban, Eye, UserCheck, Layers, Rocket, Sparkles, Target, LineChart, Calculator, TrendingDown, BookOpen,
  Home, Settings2, ListChecks, Camera, Fingerprint, Flag, Banknote, Receipt, Headphones, RefreshCw, Compass, Gauge,
  type LucideIcon,
} from "lucide-react";

export const ICONS = {
  search: Search, clipboard: ClipboardList, filecheck: FileCheck2, stamp: Stamp, graduation: GraduationCap, plane: Plane,
  shield: ShieldCheck, users: Users, building: Building2, briefcase: Briefcase, globe: Globe, clock: Clock, video: Video,
  chat: MessageCircle, mail: Mail, phone: Phone, pin: MapPin, languages: Languages, award: Award, heart: HeartHandshake,
  scale: Scale, landmark: Landmark, file: FileText, badge: BadgeCheck, wallet: Wallet, wrench: Wrench, truck: Truck,
  hardhat: HardHat, stethoscope: Stethoscope, utensils: Utensils, factory: Factory, zap: Zap, wheat: Wheat, milk: Milk,
  handshake: Handshake, lock: Lock, alert: AlertTriangle, ban: Ban, eye: Eye, usercheck: UserCheck, layers: Layers,
  rocket: Rocket, sparkles: Sparkles, target: Target, chart: LineChart, calculator: Calculator, trending: TrendingDown,
  book: BookOpen, home: Home, settings: Settings2, list: ListChecks, camera: Camera, fingerprint: Fingerprint, flag: Flag,
  money: Banknote, receipt: Receipt, support: Headphones, refresh: RefreshCw, compass: Compass, gauge: Gauge,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
