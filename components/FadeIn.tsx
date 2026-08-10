"use client";

import { motion, type MotionProps } from "motion/react";
import type { ReactNode } from "react";

/** Scroll-into-view fade/rise animation (Motion, the Framer Motion
    successor). Static-export friendly: the initial state is baked into the
    HTML snapshot; the animation hydrates client-side. */
export default function FadeIn({
  children,
  delay = 0,
  className,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
