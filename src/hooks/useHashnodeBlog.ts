import { useState, useEffect, useCallback } from 'react';

const HASHNODE_GQL_ENDPOINT = 'https://gql.hashnode.com';
const HASHNODE_HOST = 'recruitlygroup.hashnode.dev';
const CACHE_KEY = 'hashnode_blog_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  brief: string;
  content: {
    html: string;
  };
  coverImage?: {
    url: string;
  };
  publishedAt: string;
  readTimeInMinutes: number;
  author: {
    name: string;
    profilePicture?: string;
  };
}

interface CacheData {
  posts: BlogPost[];
  timestamp: number;
}

interface GraphQLResponse {
  data?: {
    publication?: {
      posts?: {
        edges?: Array<{
          node: BlogPost;
        }>;
      };
      post?: BlogPost;
    };
  };
}

const POSTS_QUERY = `
  query GetPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            id
            title
            slug
            brief
            content {
              html
            }
            coverImage {
              url
            }
            publishedAt
            readTimeInMinutes
            author {
              name
              profilePicture
            }
          }
        }
      }
    }
  }
`;

const POST_BY_SLUG_QUERY = `
  query GetPostBySlug($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        id
        title
        slug
        brief
        content {
          html
        }
        coverImage {
          url
        }
        publishedAt
        readTimeInMinutes
        author {
          name
          profilePicture
        }
      }
    }
  }
`;

const getCache = (): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCache = (posts: BlogPost[]) => {
  try {
    const data: CacheData = {
      posts,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silent fail for localStorage errors
  }
};

export const useHashnodeBlog = (limit: number = 10) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    // Check cache first
    const cached = getCache();
    if (cached && cached.posts.length >= limit) {
      setPosts(cached.posts.slice(0, limit));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(HASHNODE_GQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: POSTS_QUERY,
          variables: {
            host: HASHNODE_HOST,
            first: Math.max(limit, 10),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const result: GraphQLResponse = await response.json();
      const edges = result.data?.publication?.posts?.edges || [];
      const fetchedPosts = edges.map((edge) => edge.node);
      
      setCache(fetchedPosts);
      setPosts(fetchedPosts.slice(0, limit));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      // Try to use stale cache
      const staleCache = localStorage.getItem(CACHE_KEY);
      if (staleCache) {
        try {
          const data: CacheData = JSON.parse(staleCache);
          setPosts(data.posts.slice(0, limit));
        } catch {
          // No fallback available
        }
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

export const useHashnodePost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      // First check cache for the post
      const cached = getCache();
      const cachedPost = cached?.posts.find((p) => p.slug === slug);
      
      if (cachedPost) {
        setPost(cachedPost);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(HASHNODE_GQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: POST_BY_SLUG_QUERY,
            variables: {
              host: HASHNODE_HOST,
              slug,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }

        const result: GraphQLResponse = await response.json();
        const fetchedPost = result.data?.publication?.post || null;
        
        setPost(fetchedPost);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
};
