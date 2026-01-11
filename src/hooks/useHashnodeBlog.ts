import { useState, useEffect, useCallback } from 'react';

const HASHNODE_GQL_ENDPOINT = 'https://gql.hashnode.com';
const HASHNODE_HOST = 'komalkarki.hashnode.dev';

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

export const useHashnodeBlog = (limit: number = 10) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cache-busting: append timestamp to URL
      const cacheBustUrl = `${HASHNODE_GQL_ENDPOINT}?t=${Date.now()}`;
      
      const response = await fetch(cacheBustUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
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
      
      // Diagnostic log: print first blog title
      if (fetchedPosts.length > 0) {
        console.log('[Hashnode Blog] First post title:', fetchedPosts[0].title);
        console.log('[Hashnode Blog] Total posts fetched:', fetchedPosts.length);
      }
      
      setPosts(fetchedPosts.slice(0, limit));
      setError(null);
    } catch (err) {
      console.error('[Hashnode Blog] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
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
      try {
        setLoading(true);
        
        // Cache-busting: append timestamp to URL
        const cacheBustUrl = `${HASHNODE_GQL_ENDPOINT}?t=${Date.now()}`;
        
        const response = await fetch(cacheBustUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
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
        
        // Diagnostic log
        if (fetchedPost) {
          console.log('[Hashnode Blog] Fetched post:', fetchedPost.title);
        }
        
        setPost(fetchedPost);
        setError(null);
      } catch (err) {
        console.error('[Hashnode Blog] Fetch post error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
};
