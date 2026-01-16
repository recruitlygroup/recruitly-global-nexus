import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/hooks/useHashnodeBlog";
import { useHashnodeBlog } from "@/hooks/useHashnodeBlog";
import { useMemo } from "react";
import { format } from "date-fns";

interface RelatedPostsProps {
  currentPostId: string;
  currentPostTitle: string;
}

const RelatedPosts = ({ currentPostId, currentPostTitle }: RelatedPostsProps) => {
  const navigate = useNavigate();
  const { posts, loading } = useHashnodeBlog(10);

  // Find related posts based on title keyword matching
  const relatedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    // Extract keywords from current post title
    const titleWords = currentPostTitle
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'with', 'from', 'your', 'that', 'this', 'have', 'will'].includes(word));

    // Score other posts based on keyword overlap
    const scoredPosts = posts
      .filter(post => post.id !== currentPostId)
      .map(post => {
        const postTitleLower = post.title.toLowerCase();
        const postBriefLower = post.brief.toLowerCase();
        let score = 0;

        for (const word of titleWords) {
          if (postTitleLower.includes(word)) score += 3;
          if (postBriefLower.includes(word)) score += 1;
        }

        return { post, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.post);

    // If not enough related posts, fill with recent posts
    if (scoredPosts.length < 3) {
      const remainingPosts = posts
        .filter(post => post.id !== currentPostId && !scoredPosts.includes(post))
        .slice(0, 3 - scoredPosts.length);
      return [...scoredPosts, ...remainingPosts];
    }

    return scoredPosts;
  }, [posts, currentPostId, currentPostTitle]);

  if (loading || relatedPosts.length === 0) {
    return null;
  }

  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 border-t border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-8">
          Related Articles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handlePostClick(post.slug)}
              className="group cursor-pointer"
            >
              {/* Cover Image */}
              {post.coverImage?.url && (
                <div className="relative aspect-video mb-4 rounded-xl overflow-hidden">
                  <img
                    src={post.coverImage.url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{post.readTimeInMinutes} min read</span>
                </div>

                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.brief}
                </p>

                <div className="flex items-center gap-1 text-accent text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default RelatedPosts;
