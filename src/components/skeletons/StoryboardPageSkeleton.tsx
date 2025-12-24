import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StoryboardPageSkeleton() {
  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation Skeleton */}
      <div className="h-14 border-b border-border bg-card flex items-center px-4 gap-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </motion.div>

          {/* Script Card */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 space-y-4"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>

            {/* Duration Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted/30 rounded-lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 rounded-md" />
              ))}
            </div>

            {/* Script Content */}
            <Skeleton className="h-36 w-full rounded-lg" />
          </motion.div>

          {/* Music Mood Card */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 space-y-3"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </motion.div>

          {/* Scene Cards */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-24 rounded-md" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex justify-center pt-4"
            variants={itemVariants}
          >
            <Skeleton className="h-12 w-48 rounded-md" />
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default StoryboardPageSkeleton;
