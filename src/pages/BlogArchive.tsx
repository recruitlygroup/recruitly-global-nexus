import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHashnodeBlog } from "@/hooks/useHashnodeBlog";
import BlogListItem from "@/components/blog/BlogListItem";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import NewsletterBox from "@/components/blog/NewsletterBox";

const BlogArchive = () => {
  const navigate = useNavigate();
  const { posts, loading, error } = useHashnodeBlog(20);
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Our Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Insights & Resources
            </h1>
            <p className="text-lg text-muted-foreground">
              Expert guidance on global careers, education abroad, and making your international aspirations a reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two-Column Layout */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column - Posts */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <>
                  <BlogCardSkeleton variant="list" />
                  <BlogCardSkeleton variant="list" />
                  <BlogCardSkeleton variant="list" />
                  <BlogCardSkeleton variant="list" />
                </>
              ) : error && posts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                  <p className="text-muted-foreground">Unable to load blog posts. Please try again later.</p>
                </div>
              ) : (
                posts.map((post, index) => (
                  <BlogListItem key={post.id} post={post} index={index} />
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Recent Stories */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-2xl border border-border/50 p-6"
              >
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  Recent Stories
                </h4>
                <ul className="space-y-3">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <li key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-full mb-1" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                        </li>
                      ))}
                    </>
                  ) : (
                    recentPosts.map((post) => (
                      <li key={post.id}>
                        <button
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          className="text-left w-full group"
                        >
                          <p className="text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 font-medium">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.readTimeInMinutes} min read
                          </p>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>

              {/* Newsletter Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <NewsletterBox variant="sidebar" />
              </motion.div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogArchive;
