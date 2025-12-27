import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.99,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  duration: 0.45,
};

export function PageTransitionWrapper({ children, className }: PageTransitionWrapperProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
