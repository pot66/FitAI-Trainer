/**
 * Google & Live Web Search Service for FitAI Trainer
 * Provides real-time internet search capabilities for fitness, nutrition, supplements, and user inquiries.
 */

// 1. Detection of search necessity
function shouldSearchGoogle(message = "") {
  const text = String(message || "").trim();
  if (!text) return { shouldSearch: false, query: "", reason: "" };

  // Explicit user requests to search Google / web
  const explicitSearchRegex = /(?:ค้นหาใน\s*google|หาใน\s*google|เสิร์ช\s*google|ค้นหาข้อมูล|หาข้อมูลให้หน่อย|เสิร์ชในเน็ต|ค้นหาในเน็ต|ช่วยหาข้อมูล|search\s*google|กูเกิ้ล|ค้นข้อมูล)/i;
  if (explicitSearchRegex.test(text)) {
    // Extract query by removing search command keywords
    let cleanQuery = text
      .replace(/(?:ช่วย|กรุณา|รบกวน)?\s*(?:ค้นหาใน\s*google|หาใน\s*google|เสิร์ช\s*google|ค้นหาข้อมูล|หาข้อมูลให้หน่อย|เสิร์ชในเน็ต|ค้นหาในเน็ต|ช่วยหาข้อมูล|search\s*google|กูเกิ้ล|ค้นข้อมูล)(?:\s*(?:เกี่ยวกับ|เรื่อง|ของ))?/i, '')
      .replace(/[?？!！]/g, '')
      .trim();

    if (!cleanQuery) cleanQuery = text;
    return { shouldSearch: true, query: cleanQuery, reason: 'explicit_request' };
  }

  // Topical inquiries that benefit from real-time web search (brands, prices, reviews, latest research, specific supplements)
  const webInquiryRegex = /(?:เวย์ยี่ห้อไหนดี|creatine\s*ยี่ห้อ|อาหารเสริมตัวไหนดี|รีวิว.*pantip|ราคา.*เท่าไหร่|งานวิจัยล่าสุด|สรรพคุณของ|ประโยชน์ของ.*pantip|ของกินใหม่.*เซเว่น|เมนูใหม่เซเว่น)/i;
  if (webInquiryRegex.test(text)) {
    let cleanQuery = text.replace(/[?？!！]/g, '').trim();
    return { shouldSearch: true, query: cleanQuery, reason: 'realtime_market_inquiry' };
  }

  return { shouldSearch: false, query: "", reason: "" };
}

/**
 * Searches Google CSE (if keys available) or Live Web Search
 * @param {string} query - The search query
 * @param {object} options - Search options
 */
async function searchGoogle(query, options = {}) {
  const maxResults = options.maxResults || 4;
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return null;

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  // Tier 1: Official Google Custom Search API
  if (apiKey && cx) {
    try {
      const gUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(cleanQuery)}&num=${maxResults}&hl=th&gl=th`;
      const res = await fetch(gUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).slice(0, maxResults).map(item => ({
          title: item.title || "",
          snippet: item.snippet ? item.snippet.replace(/\n/g, ' ') : "",
          url: item.link || ""
        }));
        if (items.length > 0) {
          return {
            success: true,
            provider: 'Google Custom Search API',
            query: cleanQuery,
            results: items
          };
        }
      }
    } catch (gErr) {
      console.warn('Google CSE API error, falling back to Live Web Search:', gErr.message);
    }
  }

  // Tier 2: Real-time Live Web Search Engine
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const html = await res.text();
      const resultBlocks = html.split('<div class="result results_links results_links_deep web-result');
      const items = [];

      for (let i = 1; i < resultBlocks.length && items.length < maxResults; i++) {
        const block = resultBlocks[i];
        const headingMatch = block.match(/<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        const snippetMatch = block.match(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/);

        if (headingMatch) {
          let rawLink = headingMatch[1];
          let cleanLink = rawLink;
          if (rawLink.includes('uddg=')) {
            try {
              cleanLink = decodeURIComponent(rawLink.split('uddg=')[1].split('&')[0]);
            } catch {
              cleanLink = rawLink;
            }
          }
          if (cleanLink.startsWith('//')) {
            cleanLink = 'https:' + cleanLink;
          }

          const title = headingMatch[2].replace(/<[^>]+>/g, '').trim();
          const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          if (title && !title.includes('DuckDuckGo')) {
            items.push({
              title,
              snippet,
              url: cleanLink
            });
          }
        }
      }

      if (items.length > 0) {
        return {
          success: true,
          provider: 'Live Web Search',
          query: cleanQuery,
          results: items
        };
      }
    }
  } catch (webErr) {
    console.warn('Live Web Search error:', webErr.message);
  }

  // Tier 3: Safe Knowledge Fallback
  return {
    success: false,
    provider: 'Search Unavailable',
    query: cleanQuery,
    results: []
  };
}

/**
 * Formats search results into an LLM-friendly system prompt block
 */
function formatSearchResultsForPrompt(searchData) {
  if (!searchData || !searchData.results || !searchData.results.length) return "";

  const lines = [
    `【ข้อมูลล่าสุดจากการค้นหาบน Google / อินเทอร์เน็ต (หัวข้อ: "${searchData.query}")】:`,
    ...searchData.results.map((item, idx) =>
      `${idx + 1}. หัวข้อ: ${item.title}\n   เนื้อหาสำคัญ: ${item.snippet}\n   แหล่งที่มา: ${item.url}`
    ),
    "• คำแนะนำสำหรับโค้ช FitAI: ใช้ข้อมูลจากการค้นหาข้างต้นมาช่วยตอบคำถาม อธิบายสรุปเนื้อหาสำคัญให้เข้าใจง่าย และแนบลิงก์อ้างอิงในรูปแบบ [ชื่อบทความหรือเว็บไซต์](URL) เพื่อให้ผู้ใช้สามารถคลิกอ่านข้อมูลต้นฉบับได้"
  ];

  return lines.join("\n");
}

/**
 * Formats search results for local fallback display
 */
function formatSearchResultsForFallback(searchData) {
  if (!searchData || !searchData.results || !searchData.results.length) return "";

  const lines = [
    `🌐 **ข้อมูลที่ค้นพบจาก Google / แหล่งข้อมูลออนไลน์ (หัวข้อ: "${searchData.query}"):**`,
    "",
    ...searchData.results.map((item, idx) =>
      `${idx + 1}. **[${item.title}](${item.url})**\n   > ${item.snippet}\n`
    )
  ];

  return lines.join("\n");
}

module.exports = {
  shouldSearchGoogle,
  searchGoogle,
  formatSearchResultsForPrompt,
  formatSearchResultsForFallback
};
