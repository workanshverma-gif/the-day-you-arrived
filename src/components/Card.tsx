"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

interface CardProps {
  eyebrow: string;
  icon?: LucideIcon;
  className?: string;
  /** Optional control shown at the right end of the card header. */
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ eyebrow, icon: Icon, className = "", action, children }: CardProps) {
  return (
    <motion.section variants={itemVariants} className={`glass relative overflow-hidden rounded-3xl p-7 sm:p-9 ${className}`}>
      <header className="mb-7 flex items-center gap-2.5">
        {Icon && <Icon className="h-4 w-4 text-amber" strokeWidth={1.5} />}
        <h2 className="eyebrow">{eyebrow}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </motion.section>
  );
}

export function Skeleton({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`skeleton ${className}`} {...rest} />;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}
