import { useState, useMemo, useCallback } from 'react';
import { useHashnodeBlog, BlogPost } from './useHashnodeBlog';

// Keywords that map to blog post topics for semantic matching
const TOPIC_KEYWORDS: Record<string, string[]> = {
  romania: ['romania', 'romanian', 'bucharest', 'eu jobs', 'europe work'],
  manpower: ['manpower', 'workforce', 'staffing', 'hiring', 'recruitment', 'workers', 'employees'],
  nursing: ['nursing', 'nurse', 'healthcare', 'medical', 'hospital', 'caregiver'],
  germany: ['germany', 'german', 'berlin', 'munich', 'deutschland'],
  uk: ['uk', 'united kingdom', 'britain', 'british', 'england', 'london'],
  visa: ['visa', 'immigration', 'work permit', 'residence permit'],
  education: ['education', 'study', 'university', 'college', 'masters', 'degree', 'student'],
  construction: ['construction', 'builder', 'mason', 'carpenter', 'electrician'],
  hotel: ['hotel', 'hospitality', 'restaurant', 'chef', 'waiter', 'tourism'],
  italy: ['italy', 'italian', 'rome', 'milan'],
  canada: ['canada', 'canadian', 'toronto', 'vancouver'],
  australia: ['australia', 'australian', 'sydney', 'melbourne'],
  apostille: ['apostille', 'document', 'legalization', 'certificate', 'authentication'],
};

// Specialization regions for fallback message
const SPECIALIZATION_REGIONS = ['EU', 'Middle East', 'Gulf', 'Europe'];

export interface BlogSearchResult {
  post: BlogPost;
  score: number;
  matchedKeywords: string[];
}

export interface BlogSearchState {
  results: BlogSearchResult[];
  hasMatch: boolean;
  searchedQuery: string;
  suggestedPosts: BlogPost[];
}

export const useBlogSearch = () => {
  const { posts, loading, error } = useHashnodeBlog(20); // Fetch more posts for indexing
  const [lastSearch, setLastSearch] = useState<BlogSearchState | null>(null);

  // Create search index from blog posts
  const searchIndex = useMemo(() => {
    return posts.map(post => {
      const searchableText = `${post.title} ${post.brief}`.toLowerCase();
      return {
        post,
        searchableText,
        extractedKeywords: extractKeywords(searchableText),
      };
    });
  }, [posts]);

  // Extract keywords from text
  function extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    for (const [topic, synonyms] of Object.entries(TOPIC_KEYWORDS)) {
      for (const keyword of synonyms) {
        if (text.includes(keyword)) {
          keywords.push(topic);
          break;
        }
      }
    }
    return [...new Set(keywords)];
  }

  // Semantic search function
  const searchBlogs = useCallback((query: string): BlogSearchState => {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery || normalizedQuery.length < 2) {
      return {
        results: [],
        hasMatch: false,
        searchedQuery: query,
        suggestedPosts: posts.slice(0, 3),
      };
    }

    // Extract keywords from user query
    const queryKeywords: string[] = [];
    for (const [topic, synonyms] of Object.entries(TOPIC_KEYWORDS)) {
      for (const keyword of synonyms) {
        if (normalizedQuery.includes(keyword)) {
          queryKeywords.push(topic);
          break;
        }
      }
    }

    // Also check for exact word matches in query
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

    // Score each post
    const scoredPosts: BlogSearchResult[] = searchIndex.map(({ post, searchableText, extractedKeywords }) => {
      let score = 0;
      const matchedKeywords: string[] = [];

      // Keyword topic matching (highest weight)
      for (const keyword of queryKeywords) {
        if (extractedKeywords.includes(keyword)) {
          score += 30;
          matchedKeywords.push(keyword);
        }
      }

      // Direct word matching in title (high weight)
      for (const word of queryWords) {
        if (post.title.toLowerCase().includes(word)) {
          score += 20;
          if (!matchedKeywords.includes(word)) matchedKeywords.push(word);
        }
      }

      // Direct word matching in brief (medium weight)
      for (const word of queryWords) {
        if (post.brief.toLowerCase().includes(word)) {
          score += 10;
        }
      }

      // Full query substring match (bonus)
      if (searchableText.includes(normalizedQuery)) {
        score += 25;
      }

      return {
        post,
        score,
        matchedKeywords,
      };
    });

    // Filter and sort by score
    const results = scoredPosts
      .filter(r => r.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const hasMatch = results.length > 0;

    // Get suggested posts (random 3 from top posts if no match)
    const suggestedPosts = hasMatch
      ? []
      : posts.slice(0, 3);

    const searchResult: BlogSearchState = {
      results,
      hasMatch,
      searchedQuery: query,
      suggestedPosts,
    };

    setLastSearch(searchResult);
    return searchResult;
  }, [searchIndex, posts]);

  // Check if query likely refers to a destination we don't cover
  const isUncoveredDestination = useCallback((query: string): boolean => {
    const coveredRegions = ['romania', 'germany', 'uk', 'italy', 'canada', 'australia', 'europe', 'eu', 'gulf', 'uae', 'qatar', 'saudi'];
    const normalizedQuery = query.toLowerCase();
    
    // Check if query mentions a specific country/region not in our covered list
    const uncoveredIndicators = ['uganda', 'kenya', 'nigeria', 'india', 'pakistan', 'bangladesh', 'philippines', 'vietnam', 'china', 'japan', 'korea', 'brazil', 'mexico', 'argentina'];
    
    for (const indicator of uncoveredIndicators) {
      if (normalizedQuery.includes(indicator)) {
        // Check if we have blog posts about this
        const hasPost = posts.some(p => 
          p.title.toLowerCase().includes(indicator) || 
          p.brief.toLowerCase().includes(indicator)
        );
        return !hasPost;
      }
    }

    return false;
  }, [posts]);

  return {
    posts,
    loading,
    error,
    searchBlogs,
    lastSearch,
    isUncoveredDestination,
    SPECIALIZATION_REGIONS,
  };
};

export default useBlogSearch;
