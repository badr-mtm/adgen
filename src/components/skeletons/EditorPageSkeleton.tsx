import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function EditorPageSkeleton() {
  return (
    <motion.div
      className="h-screen bg-background flex flex-col overflow-hidden"
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Aspect Ratio Buttons */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>

          {/* Image Preview */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Skeleton className="w-full max-w-2xl aspect-video rounded-xl" />
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          className="w-80 border-l border-border bg-card p-4 space-y-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Prompt Section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>

          {/* Info Section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* AI Actions */}
          <div className="pt-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 space-y-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default EditorPageSkeleton;
