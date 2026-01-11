import { useState, useEffect, useCallback } from 'react';

const HASHNODE_GQL_ENDPOINT = 'https://gql.hashnode.com';
const HASHNODE_HOST = 'recruitlygroup.hashnode.dev';

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

// Helper to create cache-busting headers that bypass Stellate edge cache
const getCacheBustHeaders = () => ({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'x-hashnode-cache': 'no-cache', // Bypass Stellate/Hashnode edge cache
});

// Helper to create cache-busting URL
const getCacheBustUrl = () => `${HASHNODE_GQL_ENDPOINT}?nocache=${Date.now()}`;

export const useHashnodeBlog = (limit: number = 10) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (force: boolean = false) => {
    try {
      setLoading(true);
      
      // Cache-busting URL with unique timestamp
      const cacheBustUrl = getCacheBustUrl();
      
      console.log('[Hashnode] Fetching blog data | Force:', force, '| URL:', cacheBustUrl);
      console.log('[Hashnode] Host:', HASHNODE_HOST);
      
      const response = await fetch(cacheBustUrl, {
        method: 'POST',
        headers: getCacheBustHeaders(),
        body: JSON.stringify({
          query: POSTS_QUERY,
          variables: {
            host: HASHNODE_HOST,
            first: Math.max(limit, 10),
          },
        }),
        // Ensure browser doesn't use cached response
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.status}`);
      }

      const result: GraphQLResponse = await response.json();
      const edges = result.data?.publication?.posts?.edges || [];
      const fetchedPosts = edges.map((edge) => edge.node);
      
      // Diagnostic logs for debugging
      console.log('[Hashnode] ========== FETCH RESULT ==========');
      console.log('[Hashnode] Total posts received:', fetchedPosts.length);
      if (fetchedPosts.length > 0) {
        console.log('[Hashnode] NEWEST POST TITLE:', fetchedPosts[0].title);
        console.log('[Hashnode] NEWEST POST DATE:', fetchedPosts[0].publishedAt);
        console.log('[Hashnode] NEWEST POST SLUG:', fetchedPosts[0].slug);
      } else {
        console.log('[Hashnode] WARNING: No posts received from API!');
      }
      console.log('[Hashnode] ===================================');
      
      setPosts(fetchedPosts.slice(0, limit));
      setError(null);
    } catch (err) {
      console.error('[Hashnode] Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPosts(false);
  }, [fetchPosts]);

  // Expose refetch with force parameter
  const refetch = useCallback(() => fetchPosts(true), [fetchPosts]);

  return { posts, loading, error, refetch };
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
      try {
        setLoading(true);
        
        // Cache-busting URL with unique timestamp
        const cacheBustUrl = getCacheBustUrl();
        
        console.log('[Hashnode] Fetching single post:', slug);
        console.log('[Hashnode] URL:', cacheBustUrl);
        
        const response = await fetch(cacheBustUrl, {
          method: 'POST',
          headers: getCacheBustHeaders(),
          body: JSON.stringify({
            query: POST_BY_SLUG_QUERY,
            variables: {
              host: HASHNODE_HOST,
              slug,
            },
          }),
          // Ensure browser doesn't use cached response
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch blog post: ${response.status}`);
        }

        const result: GraphQLResponse = await response.json();
        const fetchedPost = result.data?.publication?.post || null;
        
        if (fetchedPost) {
          console.log('[Hashnode] Fetched post title:', fetchedPost.title);
          console.log('[Hashnode] Fetched post date:', fetchedPost.publishedAt);
        } else {
          console.log('[Hashnode] Post not found for slug:', slug);
        }
        
        setPost(fetchedPost);
        setError(null);
      } catch (err) {
        console.error('[Hashnode] Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
};
