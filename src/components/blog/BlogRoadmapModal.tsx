import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, ArrowRight, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/hooks/useHashnodeBlog";
import { BlogSearchResult } from "@/hooks/useBlogSearch";

interface BlogRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  results: BlogSearchResult[];
  hasMatch: boolean;
  suggestedPosts: BlogPost[];
  specializationRegions: string[];
}

const BlogRoadmapModal = ({
  isOpen,
  onClose,
  searchQuery,
  results,
  hasMatch,
  suggestedPosts,
  specializationRegions,
}: BlogRoadmapModalProps) => {
  const navigate = useNavigate();

  const handleReadPost = (slug: string) => {
    onClose();
    navigate(`/blog/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative border border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 hover:bg-destructive/10"
            >
              <X className="w-5 h-5" />
            </Button>

            {hasMatch ? (
              /* Match Found - Show AI Roadmap with Blog Results */
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">AI Roadmap</h3>
                    <p className="text-sm text-muted-foreground">
                      We found guides matching "{searchQuery}"
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <motion.div
                      key={result.post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-4 rounded-xl border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                      onClick={() => handleReadPost(result.post.slug)}
                    >
                      <div className="flex gap-4">
                        {result.post.coverImage?.url && (
                          <img
                            src={result.post.coverImage.url}
                            alt={result.post.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                              {Math.round((result.score / 85) * 100)}% match
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {result.post.readTimeInMinutes} min read
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                            {result.post.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.post.brief}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-accent hover:text-accent-foreground hover:bg-accent"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read Full Guide
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button
                    onClick={() => {
                      onClose();
                      navigate('/blog');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Browse All Guides
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Continue Searching
                  </Button>
                </div>
              </div>
            ) : (
              /* No Match Found - Show Uganda Logic */
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">No Guide Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      For "{searchQuery}"
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-foreground leading-relaxed">
                    We haven't published a guide for <strong>{searchQuery}</strong> yet, but our experts can still help!
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    <span className="font-semibold text-foreground">Recruitly Group</span> specializes in{' '}
                    <span className="text-accent font-medium">{specializationRegions.join(' and ')}</span> pathways.
                    Check out our trending destinations below:
                  </p>
                </div>

                {suggestedPosts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      Popular Destinations
                    </h4>
                    {suggestedPosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-3 rounded-xl border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer flex gap-3"
                        onClick={() => handleReadPost(post.slug)}
                      >
                        {post.coverImage?.url && (
                          <img
                            src={post.coverImage.url}
                            alt={post.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1 text-sm">
                            {post.title}
                          </h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {post.brief}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent flex-shrink-0 self-center" />
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button
                    onClick={() => {
                      onClose();
                      navigate('/blog');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Browse All Guides
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Talk to an Expert
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlogRoadmapModal;
