import { motion } from "framer-motion";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function SystemHealthStripSkeleton() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-between px-4 py-3 bg-card/50 border border-border rounded-lg"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          {i < 4 && <div className="w-px h-4 bg-border ml-4" />}
        </div>
      ))}
    </motion.div>
  );
}

function PrimaryActionZoneSkeleton() {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Create New Ad Card */}
      <div className="lg:col-span-2">
        <Card className="h-full bg-gradient-to-br from-primary/5 via-primary/2 to-card border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Card */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function ActiveCampaignsSnapshotSkeleton() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreativePerformanceSkeleton() {
  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function BrandSystemReadinessSkeleton() {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Profile */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </CardContent>
      </Card>

      {/* Ad Platforms */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardSkeleton() {
  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SystemHealthStripSkeleton />
      <PrimaryActionZoneSkeleton />
      <ActiveCampaignsSnapshotSkeleton />
      <CreativePerformanceSkeleton />
      <BrandSystemReadinessSkeleton />
    </motion.div>
  );
}

export {
  SystemHealthStripSkeleton,
  PrimaryActionZoneSkeleton,
  ActiveCampaignsSnapshotSkeleton,
  CreativePerformanceSkeleton,
  BrandSystemReadinessSkeleton,
};
