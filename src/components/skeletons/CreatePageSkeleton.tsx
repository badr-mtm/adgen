import { motion } from "framer-motion";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

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

export function CreatePageSkeleton() {
  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="text-center space-y-3" variants={itemVariants}>
        <Skeleton className="h-9 w-80 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </motion.div>

      {/* Form Skeleton */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </motion.div>

      {/* Recent Campaigns Section */}
      <motion.div className="space-y-4" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CreatePageSkeleton;
