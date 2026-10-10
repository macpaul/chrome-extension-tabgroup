/**
 * URL Utilities for Tab Purger & Grouper
 */

export const TAB_GROUP_COLORS = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'pink',
  'grey'
];

export const COMMON_TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'si'
]);

/**
 * Predefined Smart Categories for grouping
 */
export const CATEGORY_DEFINITIONS = [
  {
    id: 'ai_search',
    name: '🔍 搜尋與 AI',
    color: 'blue',
    patterns: [
      /^(www\.)?google\.(com|com\.[a-z]{2}|[a-z]{2})$/i,
      /^(www\.)?bing\.com$/i,
      /^(www\.)?duckduckgo\.com$/i,
      /^(www\.)?chatgpt\.com$/i,
      /^(chat\.)?openai\.com$/i,
      /^(www\.)?claude\.ai$/i,
      /^gemini\.google\.com$/i,
      /^(www\.)?perplexity\.ai$/i,
      /^(www\.)?poe\.com$/i,
      /^(copilot\.)?microsoft\.com$/i
    ]
  },
  {
    id: 'development',
    name: '💼 開發與技術',
    color: 'cyan',
    patterns: [
      /^(www\.)?github\.com$/i,
      /^(www\.)?gitlab\.com$/i,
      /^(www\.)?bitbucket\.org$/i,
      /^(www\.)?stackoverflow\.com$/i,
      /^(.*\.)?stackexchange\.com$/i,
      /^(developer\.)?mozilla\.org$/i,
      /^(www\.)?npmjs\.com$/i,
      /^(www\.)?pypi\.org$/i,
      /^(hub\.)?docker\.com$/i,
      /^(www\.)?dev\.to$/i,
      /^(www\.)?vercel\.com$/i,
      /^(console\.)?cloud\.google\.com$/i,
      /^(.*?\.)?aws\.amazon\.com$/i
    ]
  },
  {
    id: 'social',
    name: '💬 社群與通訊',
    color: 'pink',
    patterns: [
      /^(www\.)?twitter\.com$/i,
      /^(www\.)?x\.com$/i,
      /^(www\.)?facebook\.com$/i,
      /^(www\.)?instagram\.com$/i,
      /^(www\.)?linkedin\.com$/i,
      /^(www\.)?reddit\.com$/i,
      /^(www\.)?discord\.com$/i,
      /^(web\.)?whatsapp\.com$/i,
      /^(web\.)?telegram\.org$/i,
      /^(www\.)?threads\.net$/i,
      /^(www\.)?line\.me$/i
    ]
  },
  {
    id: 'media',
    name: '🎬 影音與串流',
    color: 'red',
    patterns: [
      /^(www\.)?youtube\.com$/i,
      /^youtu\.be$/i,
      /^(www\.)?netflix\.com$/i,
      /^(www\.)?twitch\.tv$/i,
      /^(www\.)?disneyplus\.com$/i,
      /^(open\.)?spotify\.com$/i,
      /^(www\.)?bilibili\.com$/i,
      /^(www\.)?tiktok\.com$/i,
      /^(www\.)?vimeo\.com$/i,
      /^(www\.)?soundcloud\.com$/i
    ]
  },
  {
    id: 'docs',
    name: '📝 文件與協作',
    color: 'purple',
    patterns: [
      /^(www\.)?notion\.so$/i,
      /^docs\.google\.com$/i,
      /^drive\.google\.com$/i,
      /^(www\.)?figma\.com$/i,
      /^(www\.)?miro\.com$/i,
      /^(www\.)?trello\.com$/i,
      /^(.*\.)?atlassian\.net$/i,
      /^(app\.)?slack\.com$/i,
      /^(app\.)?asana\.com$/i,
      /^(linear\.)?app$/i
    ]
  },
  {
    id: 'shopping',
    name: '🛒 購物與電商',
    color: 'yellow',
    patterns: [
      /^(www\.)?amazon\.(com|com\.[a-z]{2}|[a-z]{2})$/i,
      /^(www\.)?shopee\.(tw|com|vn|ph|sg)$/i,
      /^(www\.)?momo\.com\.tw$/i,
      /^(24h\.)?pchome\.com\.tw$/i,
      /^(www\.)?taobao\.com$/i,
      /^(www\.)?ebay\.com$/i,
      /^(www\.)?ruten\.com\.tw$/i,
      /^(www\.)?coupang\.com$/i
    ]
  },
  {
    id: 'news',
    name: '📰 新聞與閱讀',
    color: 'green',
    patterns: [
      /^(www\.)?bbc\.com$/i,
      /^(www\.)?cnn\.com$/i,
      /^(tw\.)?news\.yahoo\.com$/i,
      /^(www\.)?medium\.com$/i,
      /^(.*\.)?substack\.com$/i,
      /^(news\.)?ycombinator\.com$/i,
      /^(www\.)?udn\.com$/i,
      /^(news\.)?ltn\.com\.tw$/i,
      /^(www\.)?ettoday\.net$/i,
      /^(www\.)?cna\.com\.tw$/i
    ]
  }
];

/**
 * Normalizes URL for duplicate comparison
 * @param {string} rawUrl
 * @param {Object} options
 * @returns {string}
 */
export function normalizeUrl(rawUrl, options = {}) {
  const {
    ignoreHash = true,
    ignoreQuery = false,
    ignoreTrackingParams = true,
    ignoreTrailingSlash = true
  } = options;

  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);

    // Skip special browser protocols
    if (['chrome:', 'chrome-extension:', 'edge:', 'about:'].includes(url.protocol)) {
      return url.href.replace(/\/+$/, '');
    }

    // Strip hash fragment
    if (ignoreHash) {
      url.hash = '';
    }

    // Strip query parameters
    if (ignoreQuery) {
      url.search = '';
    } else if (ignoreTrackingParams && url.search) {
      const searchParams = new URLSearchParams(url.search);
      let changed = false;
      for (const key of Array.from(searchParams.keys())) {
        if (COMMON_TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
          searchParams.delete(key);
          changed = true;
        }
      }
      if (changed) {
        url.search = searchParams.toString();
      }
    }

    let result = url.toString();

    // Remove trailing slash if desired (except protocol root e.g. https://example.com/)
    if (ignoreTrailingSlash && url.pathname.length > 1 && result.endsWith('/')) {
      result = result.slice(0, -1);
    }

    return result;
  } catch {
    // If not a parseable URL, fallback to raw trimmed string
    return rawUrl.trim();
  }
}

/**
 * Common multi-part top level domains (e.g., com.tw, co.uk)
 */
const MULTI_PART_TLDS = new Set([
  'com.tw', 'org.tw', 'edu.tw', 'gov.tw', 'idv.tw',
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
  'co.jp', 'ne.jp', 'ac.jp', 'go.jp',
  'com.au', 'net.au', 'org.au',
  'com.hk', 'org.hk', 'edu.hk',
  'com.cn', 'net.cn', 'org.cn',
  'com.br', 'co.nz', 'co.kr'
]);

/**
 * Extract clean hostname or main domain from URL
 * @param {string} rawUrl
 * @param {Object} options
 * @returns {string}
 */
export function extractDomain(rawUrl, options = {}) {
  const { useMainDomain = false } = options;

  if (!rawUrl) return '其他';

  try {
    const url = new URL(rawUrl);

    if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
      return 'Chrome 系統頁面';
    }
    if (url.protocol === 'file:') {
      return '本地檔案 (file://)';
    }

    let hostname = url.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    if (!useMainDomain) {
      return hostname || '其他';
    }

    // Main domain resolution (e.g. drive.google.com -> google.com)
    const parts = hostname.split('.');
    if (parts.length <= 2) {
      return hostname;
    }

    const lastTwo = parts.slice(-2).join('.');
    if (MULTI_PART_TLDS.has(lastTwo)) {
      if (parts.length >= 3) {
        return parts.slice(-3).join('.');
      }
      return hostname;
    }

    return parts.slice(-2).join('.');
  } catch {
    return '其他';
  }
}

/**
 * Categorize a tab URL into a smart category or domain
 * @param {string} rawUrl
 * @param {string} title
 * @param {Object} options
 * @returns {{ id: string, name: string, color: string, isCategory: boolean }}
 */
export function categorizeTab(rawUrl, title = '', options = {}) {
  const domain = extractDomain(rawUrl, options);

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    for (const cat of CATEGORY_DEFINITIONS) {
      for (const pattern of cat.patterns) {
        if (pattern.test(hostname)) {
          return {
            id: cat.id,
            name: cat.name,
            color: cat.color,
            isCategory: true
          };
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback to domain
  return {
    id: `domain_${domain}`,
    name: domain,
    color: 'blue',
    isCategory: false
  };
}
