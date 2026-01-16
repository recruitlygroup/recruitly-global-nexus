import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useHashnodePost } from "@/hooks/useHashnodeBlog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import TableOfContents from "@/components/blog/TableOfContents";
import SocialShareBar from "@/components/blog/SocialShareBar";
import BackToTop from "@/components/blog/BackToTop";
import EndOfPostCTA from "@/components/blog/EndOfPostCTA";

const BlogPostSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
    <Skeleton className="h-8 w-32 mb-8" />
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-12 w-3/4 mb-6" />
    <div className="flex gap-4 mb-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="w-full h-96 rounded-2xl mb-12" />
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, loading, error } = useHashnodePost(slug || "");
  const contentRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <BlogPostSkeleton />
        <SiteFooter />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Article Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Blog
          </Button>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const hasImage = !!post.coverImage?.url;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <article className="pt-24 pb-12">
        {/* Back Button */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Button
            onClick={() => navigate("/blog")}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Blog
          </Button>
        </div>

        {hasImage ? (
          <>
            {/* Hero with Cover Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-[400px] md:h-[500px] mb-12"
            >
              <img
                src={post.coverImage?.url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-3xl mx-auto">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                  >
                    {post.title}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readTimeInMinutes} min read
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* Header without Cover Image - Ness Labs Style */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTimeInMinutes} min read
              </span>
            </div>
          </motion.div>
        )}

        {/* Table of Contents */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <TableOfContents contentRef={contentRef} />
        </div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            ref={contentRef}
            className="hashnode-content-wrapper"
            dangerouslySetInnerHTML={{
              __html: post.content.html,
            }}
          />

          {/* Social Share Bar */}
          <SocialShareBar title={post.title} url={currentUrl} />
        </motion.div>
      </article>

      {/* End of Post CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <EndOfPostCTA />
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />

      <SiteFooter />
    </main>
  );
};

export default BlogPost;
