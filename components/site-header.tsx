"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navLinks = [
  { href: "/simulator", label: "Simulator" },
  { href: "/compare", label: "Compare" },
  { href: "/calibrate", label: "Calibrate" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          GlucoTwin
        </Link>
        <nav className="-mr-1.5 flex items-center text-[13px] sm:mr-0 sm:gap-1 sm:text-sm">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-sm px-1.5 py-1.5 transition-colors duration-150 ease-out sm:px-3",
                  active ? "text-accent" : "text-muted hover:text-text",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
