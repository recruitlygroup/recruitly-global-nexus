import { Skeleton } from "@/components/ui/skeleton";

interface BlogCardSkeletonProps {
  variant?: 'card' | 'list';
}

const BlogCardSkeleton = ({ variant = 'card' }: BlogCardSkeletonProps) => {
  if (variant === 'list') {
    return (
      <div className="flex gap-6 p-6 bg-card rounded-2xl border border-border/50">
        <Skeleton className="w-48 h-32 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};

export default BlogCardSkeleton;
