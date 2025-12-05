import * as cheerio from "cheerio";

export interface WebMetadata {
  title?: string;
  author?: string;
  publishDate?: Date;
  description?: string;
  url: string;
  domain?: string;
  language?: string;
}

export interface ProcessedWebContent {
  text: string;
  metadata: WebMetadata;
}

/**
 * Extract clean text and metadata from HTML content
 */
export async function processWebContent(
  html: string,
  url: string,
): Promise<ProcessedWebContent> {
  console.log(`   🌐 Processing web content from: ${url}`);
  
  const $ = cheerio.load(html);
  
  // Remove script, style, nav, footer, header, and other non-content elements
  $('script, style, nav, footer, header, aside, .nav, .navigation, .footer, .header, .sidebar, .ad, .ads, .advertisement').remove();
  
  // Extract title
  const title = $('title').text() || 
                $('meta[property="og:title"]').attr('content') ||
                $('h1').first().text() ||
                '';
  
  // Extract author
  const author = $('meta[name="author"]').attr('content') ||
                 $('meta[property="article:author"]').attr('content') ||
                 $('.author, [rel="author"]').first().text().trim() ||
                 '';
  
  // Extract publish date
  let publishDate: Date | undefined;
  const dateStr = $('meta[property="article:published_time"]').attr('content') ||
                  $('meta[name="publish-date"]').attr('content') ||
                  $('time[datetime]').attr('datetime') ||
                  $('time').first().attr('datetime') ||
                  '';
  if (dateStr) {
    publishDate = new Date(dateStr);
    if (isNaN(publishDate.getTime())) {
      publishDate = undefined;
    }
  }
  
  // Extract description
  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     '';
  
  // Extract main content - try common article selectors
  let mainContent = '';
  const articleSelectors = [
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    'main',
    '#content',
    '.main-content',
  ];
  
  for (const selector of articleSelectors) {
    const content = $(selector).first();
    if (content.length > 0) {
      mainContent = content.text();
      break;
    }
  }
  
  // Fallback: use body if no article found
  if (!mainContent) {
    mainContent = $('body').text();
  }
  
  // Clean up text: remove extra whitespace, normalize newlines
  const cleanText = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
  
  // Extract domain from URL
  let domain: string | undefined;
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname;
  } catch (e) {
    // Invalid URL, skip domain extraction
  }
  
  const metadata: WebMetadata = {
    title: title.trim() || undefined,
    author: author || undefined,
    publishDate,
    description: description.trim() || undefined,
    url,
    domain,
  };
  
  console.log(`   ✅ Web content processed:`);
  console.log(`      - Title: ${metadata.title || 'N/A'}`);
  console.log(`      - Domain: ${metadata.domain || 'N/A'}`);
  console.log(`      - Text length: ${cleanText.length} characters`);
  if (metadata.publishDate) {
    console.log(`      - Publish date: ${metadata.publishDate.toISOString()}`);
  }
  
  return {
    text: cleanText,
    metadata,
  };
}

/**
 * Fetch and process web content from URL
 */
export async function fetchAndProcessWebContent(
  url: string,
): Promise<ProcessedWebContent> {
  console.log(`   🔗 Fetching content from URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    return processWebContent(html, url);
  } catch (error: any) {
    console.error(`   ❌ Error fetching web content:`, error.message);
    throw new Error(`Failed to fetch web content: ${error.message}`);
  }
}

