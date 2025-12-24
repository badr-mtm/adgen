import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationType = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "slide-up" | "none";

interface AnimatedContainerProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  staggerChildren?: number;
}

const animationVariants: Record<AnimationType, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  "scale": {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "none": {
    hidden: {},
    visible: {},
  },
};

export function AnimatedContainer({
  animation = "fade-up",
  delay = 0,
  duration = 0.4,
  children,
  className,
  staggerChildren,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationVariants[animation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
        ...(staggerChildren && {
          staggerChildren,
        }),
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for lists
interface StaggerContainerProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger item for use inside StaggerContainer
interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
}

export function StaggerItem({
  children,
  className,
  animation = "fade-up",
  ...props
}: StaggerItemProps) {
  return (
    <motion.div
      variants={animationVariants[animation]}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// Hover scale wrapper
interface HoverScaleProps extends Omit<HTMLMotionProps<"div">, "whileHover" | "whileTap"> {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  tapScale?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.02,
  tapScale = 0.98,
  ...props
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}