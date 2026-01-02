import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/hooks/useHashnodeBlog";
import { format } from "date-fns";

interface BlogListItemProps {
  post: BlogPost;
  index?: number;
}

const BlogListItem = ({ post, index = 0 }: BlogListItemProps) => {
  const navigate = useNavigate();
  const hasImage = !!post.coverImage?.url;

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="group cursor-pointer flex gap-6 p-6 bg-card rounded-2xl border border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
    >
      {hasImage && (
        <div className="relative w-48 h-32 rounded-xl overflow-hidden shrink-0 hidden sm:block">
          <img
            src={post.coverImage?.url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.brief}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
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
    </motion.article>
  );
};

export default BlogListItem;
