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

export const useHashnodeBlog = (limit: number = 10) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cache-busting: append timestamp to force fresh data
      const cacheBustUrl = `${HASHNODE_GQL_ENDPOINT}?t=${Date.now()}`;
      
      console.log('[Hashnode] Fetching fresh blog data from:', cacheBustUrl);
      
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
        console.log('[Hashnode] First blog post title:', fetchedPosts[0].title);
        console.log('[Hashnode] Total posts fetched:', fetchedPosts.length);
      } else {
        console.log('[Hashnode] No posts received from API');
      }
      
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
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

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
        
        // Cache-busting: append timestamp to force fresh data
        const cacheBustUrl = `${HASHNODE_GQL_ENDPOINT}?t=${Date.now()}`;
        
        console.log('[Hashnode] Fetching single post:', slug);
        
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
        
        if (fetchedPost) {
          console.log('[Hashnode] Fetched post title:', fetchedPost.title);
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
