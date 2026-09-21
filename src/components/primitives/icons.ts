import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  ChartNoAxesColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Compass,
  Eye,
  EyeOff,
  Grid2x2,
  Headset,
  House,
  IndianRupee,
  Info,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  Phone,
  Ruler,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * The icon vocabulary. Every icon in the app is one of these, drawn from a single family
 * (lucide: 24px grid, rounded joins, rendered at a 1.75 stroke by `Icon`), and every meaning has
 * exactly one glyph, so the same idea never appears as two different pictures. Screens import
 * `icons.<meaning>`, never a raw glyph.
 */
export const icons = {
  // navigation and chrome
  home: House,
  menu: Menu,
  back: ChevronLeft,
  forward: ChevronRight,
  close: X,
  search: Search,
  filter: SlidersHorizontal,
  notifications: Bell,
  support: Headset,
  profile: UserRound,
  settings: Settings,
  signOut: LogOut,

  // states
  check: Check,
  verified: BadgeCheck,
  info: Info,
  warning: TriangleAlert,
  alert: CircleAlert,
  show: Eye,
  hide: EyeOff,

  // the seven dashboard sections
  projects: Building2,
  booking: ShoppingCart,
  calculator: Calculator,
  siteVisits: MapPinned,
  teamSales: ChartNoAxesColumn,
  addMember: UserPlus,
  myTeam: Users,

  // entry paths
  guest: Compass,
  associate: Briefcase,
  client: KeyRound,

  // real-estate facts
  plot: Grid2x2,
  area: Ruler,
  price: IndianRupee,
  location: MapPin,
  visit: CalendarCheck,
  phone: Phone,
  mail: Mail,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
