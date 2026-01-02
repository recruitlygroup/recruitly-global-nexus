import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/hooks/useHashnodeBlog";
import { format } from "date-fns";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

const BlogCard = ({ post, index = 0 }: BlogCardProps) => {
  const navigate = useNavigate();
  const hasImage = !!post.coverImage?.url;
  
  const excerpt = post.brief?.length > 120 
    ? post.brief.slice(0, 120) + '...' 
    : post.brief || '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="group cursor-pointer bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300"
    >
      {hasImage ? (
        <>
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage?.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(post.publishedAt), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTimeInMinutes} min read
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-4 leading-tight">
              {post.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {post.brief?.slice(0, 180)}...
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(post.publishedAt), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTimeInMinutes} min read
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}
    </motion.article>
  );
};

export default BlogCard;
