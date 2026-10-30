import {
  ArrowLeftRight,
  ShieldCheck,
  ArrowRight,
  Banknote,
  Check,
  Headset,
  Heart,
  Search,
  ShoppingBag,
  Truck,
  User,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/** Lucide icons tuned to the handoff spec: 1.8 stroke, 22px default, rounded joins. */
const tuned =
  (Icon: LucideIcon) =>
  // eslint-disable-next-line react/display-name
  (p: LucideProps) => <Icon size={22} strokeWidth={1.8} absoluteStrokeWidth {...p} />;

export const SearchIcon = tuned(Search);
export const HeadsetIcon = tuned(Headset);
export const UserIcon = tuned(User);
export const BagIcon = tuned(ShoppingBag);
export const CheckIcon = tuned(Check);
export const ArrowRightIcon = tuned(ArrowRight);
export const TruckIcon = tuned(Truck);
export const CashIcon = tuned(Banknote);
export const SwapIcon = tuned(ArrowLeftRight);
export const ShieldIcon = tuned(ShieldCheck);

export const HeartIcon = ({ filled, ...p }: LucideProps & { filled?: boolean }) => (
  <Heart size={22} strokeWidth={1.8} absoluteStrokeWidth fill={filled ? 'currentColor' : 'none'} {...p} />
);

/** Brand mark: the Xivoo X — black arms with the orange swoosh. */
export const LogoMark = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
    <rect width="40" height="40" rx="10" fill="#16181A" />
    <path d="M11 11l7 7" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M23 23l6.5 6.5" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M9.5 30.5C14 27 24 15 30.5 9.5" stroke="#FF6A00" strokeWidth="5.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#16181A"/><path d="M11 11l7 7" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round"/><path d="M23 23l6.5 6.5" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round"/><path d="M9.5 30.5C14 27 24 15 30.5 9.5" stroke="#FF6A00" stroke-width="5.5" stroke-linecap="round" fill="none"/></svg>`,
  );
