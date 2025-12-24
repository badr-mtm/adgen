import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const getVariants = (direction: RevealDirection, distance: number = 40): Variants => {
  const directions: Record<RevealDirection, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants(direction)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: RevealDirection;
  once?: boolean;
}

export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 0.1,
  direction = "up",
  once = true,
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = getVariants(direction);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className,
  direction = "up",
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  duration?: number;
}) {
  return (
    <motion.div
      variants={getVariants(direction)}
      transition={{
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
