import type { ReactElement, ReactNode } from "react";
import type { CategoryId } from "@/lib/catalog";

type IconProps = { className?: string };

const stroke = "#1B4332";
const fill = "#FFFFFF";

function SvgShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function MensCareIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <circle cx="32" cy="22" r="9" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <path
        d="M18 52c2.5-10 8-15 14-15s11.5 5 14 15"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill={fill}
      />
      <path
        d="M40 36.5c3.5 1 6 4 7 8"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M44.5 40.5c1.8-.2 3.2 1.2 3 3-.8 2.2-3.2 3.5-5 2.8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill={fill}
      />
    </SvgShell>
  );
}

function WomensCareIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <circle cx="30" cy="21" r="9" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <path
        d="M17 52c2-10 7.5-15 13-15s11 5 13 15"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill={fill}
      />
      <path
        d="M41 34c2.5 1.5 4.5 4.5 5.5 8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M44 38.5c2.2-1.8 5.5-.2 5.2 2.6-.3 2.2-2.4 3.4-4.2 2.8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill={fill}
      />
      <circle cx="47.5" cy="41" r="1.2" fill={stroke} />
    </SvgShell>
  );
}

function MajoonIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <rect x="20" y="24" width="24" height="26" rx="4" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <path d="M24 24v-3.5a8 8 0 0 1 16 0V24" stroke={stroke} strokeWidth="1.6" />
      <path d="M26 34h12M26 40h8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M42 18c4 2 7 6 8 11"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="31" rx="2.2" ry="3" fill={fill} stroke={stroke} strokeWidth="1.3" />
    </SvgShell>
  );
}

function OilsIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <rect x="24" y="22" width="16" height="26" rx="3.5" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <rect x="28" y="16" width="8" height="7" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M30 16V13.5a2 2 0 0 1 4 0V16" stroke={stroke} strokeWidth="1.4" />
      <path d="M32 28v12" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M18 20l6 6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="18.5" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <path
        d="M40 42c3 1.5 6 0 7.5-3"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M43 40.5c1.5 2.5 0 5-2.2 5.5"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill={fill}
      />
    </SvgShell>
  );
}

function PowdersIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <path
        d="M18 42h28l-4 8H22l-4-8Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M22 42c0-8 4-16 10-20 6 4 10 12 10 20"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M32 14v10" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="12" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <path d="M26 36h12" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
    </SvgShell>
  );
}

function SalajeetIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <path
        d="M14 40c4-8 10-12 18-12s14 4 18 12"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 40c3-5 7-8 14-8s11 3 14 8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect x="22" y="28" width="14" height="18" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <path d="M25 34h8M25 39h5" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M40 34c3-1 7 1 8 5-2 3-6 4-9 2l-2-3 3-4Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </SvgShell>
  );
}

function DigestionIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <path
        d="M32 12c-2 8-10 14-10 24a10 10 0 0 0 20 0c0-10-8-16-10-24Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M32 22v18" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M32 28c-3 2-5 5-5 8M32 28c3 2 5 5 5 8"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </SvgShell>
  );
}

function SeedsIcon({ className }: IconProps) {
  return (
    <SvgShell className={className}>
      <ellipse cx="24" cy="28" rx="6" ry="9" fill={fill} stroke={stroke} strokeWidth="1.5" transform="rotate(-20 24 28)" />
      <ellipse cx="40" cy="26" rx="5.5" ry="8.5" fill={fill} stroke={stroke} strokeWidth="1.5" transform="rotate(18 40 26)" />
      <ellipse cx="32" cy="40" rx="6.5" ry="9.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M32 33v14M24 24v8M40 22v8" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </SvgShell>
  );
}

export const categoryIcons: Record<CategoryId, (props: IconProps) => ReactElement> = {
  "mens-care": MensCareIcon,
  "womens-care": WomensCareIcon,
  majoon: MajoonIcon,
  oils: OilsIcon,
  powders: PowdersIcon,
  salajeet: SalajeetIcon,
  digestion: DigestionIcon,
  seeds: SeedsIcon,
};
