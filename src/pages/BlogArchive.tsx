import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { BookOpen } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useHashnodeBlog } from "@/hooks/useHashnodeBlog";
import BlogListItem from "@/components/blog/BlogListItem";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import BlogPagination from "@/components/blog/BlogPagination";
import NewsletterBox from "@/components/blog/NewsletterBox";
import { STUDY_COUNTRIES, filterPostsByCountry, getStudyCountry } from "@/data/studyCountries";

/** Posts per page on /blog. */
const BLOG_PAGE_SIZE = 10;

const BlogArchive = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load every post (the hook used to be capped at 20, which hid older articles).
  const { posts: allPosts, loading, error } = useHashnodeBlog(Infinity);

  // Optional country filter: /blog?country=italy
  const country = getStudyCountry(searchParams.get("country") ?? undefined);
  const posts = useMemo(() => (country ? filterPostsByCountry(allPosts, country) : allPosts), [allPosts, country]);

  // Pagination state lives in the URL: /blog?page=2
  const requestedPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const pagePosts = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const recentPosts = allPosts.slice(0, 5);

  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (country) q.set("country", country.slug);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  useSEO({
    title: `${country ? `Study in ${country.name} articles` : "Blog | Tips on Study Abroad, Jobs & Travel"}${page > 1 ? ` (Page ${page})` : ""} – Recruitly Group`,
    description: "Read expert articles on studying in Europe, overseas jobs, visa tips, apostille processes, and travel guides — all from Recruitly Group's blog.",
    keywords: "study abroad blog, visa tips Nepal, overseas jobs blog, Europe travel guides, apostille how to",
    canonicalUrl: `https://www.recruitlygroup.com${hrefFor(page)}`,
  });

  // After a page change, jump back to the top of the list.
  useEffect(() => {
    if (!loading) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, country?.slug, loading]);

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

          {/* Country filter chips */}
          <nav aria-label="Filter articles by study destination" className="mt-8 flex flex-wrap justify-center gap-2">
            {[{ slug: "", name: "All articles" }, ...STUDY_COUNTRIES].map((c) => {
              const active = (country?.slug ?? "") === c.slug;
              return (
                <Link
                  key={c.slug || "all"}
                  to={c.slug ? `/blog?country=${c.slug}` : "/blog"}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {c.slug ? `Study in ${c.name}` : c.name}
                </Link>
              );
            })}
          </nav>
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
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                  <p className="text-muted-foreground">No articles for {country?.name} yet. New guides appear here as soon as they are published.</p>
                  <Link to="/blog" className="mt-3 inline-block text-primary hover:underline">View all articles</Link>
                </div>
              ) : (
                <>
                  {pagePosts.map((post, index) => (
                    <BlogListItem key={post.id} post={post} index={index} />
                  ))}
                  <BlogPagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
                </>
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
