import mockAnalyses from "@/services/mockData/analyses.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock NLP analysis function
// Helper function to calculate entity confidence scores
const calculateConfidence = (entity, text, category) => {
  const occurrences = (text.match(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
  let baseScore = Math.min(occurrences * 0.2, 1.0);
  
  // Category-specific confidence adjustments
  if (category === 'organizations' && entity.match(/\b(?:Inc|LLC|Corp|Company)\b/)) baseScore += 0.3;
  if (category === 'people' && entity.split(' ').length === 2) baseScore += 0.2;
  if (category === 'locations' && entity.match(/^[A-Z][a-z]+,\s*[A-Z]{2}$/)) baseScore += 0.3;
  if (category === 'technologies' && entity.match(/\b(?:API|SDK|JS|AI)\b/)) baseScore += 0.2;
  
  return Math.min(baseScore, 1.0);
};

// Enhanced entity extraction with NLP patterns
const extractEntities = (text) => {
  const entities = {
    people: new Set(),
    organizations: new Set(),
    locations: new Set(),
    products: new Set(),
    technologies: new Set(),
    events: new Set(),
    misc: new Set()
  };

  // Common organization suffixes and prefixes
  const orgPatterns = [
    /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Foundation|Institute|University|College|School)\b/g,
    /\b(?:Apple|Google|Microsoft|Amazon|Facebook|Meta|Tesla|Netflix|Spotify|Adobe|Intel|AMD|NVIDIA|Samsung|Sony|IBM|Oracle|Salesforce|Zoom|Slack|Twitter|LinkedIn|YouTube|Instagram|TikTok|WhatsApp|Uber|Airbnb|PayPal|Shopify|WordPress|GitHub|Stack Overflow|Reddit|Discord|Twitch)\b/gi
  ];

  // Person name patterns (Title + Name or First Last)
  const personPatterns = [
    /\b(?:Mr|Mrs|Ms|Dr|Prof|Professor|CEO|CTO|CFO|President|Director|Manager|VP|Vice President|Chief|Senior|Lead|Principal)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /\b([A-Z][a-z]+\s+(?:van\s+|de\s+|del\s+|la\s+|le\s+)?[A-Z][a-z]+)(?:\s+(?:said|told|mentioned|explained|stated|announced|reported))/g
  ];

  // Location patterns
  const locationPatterns = [
    /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b/g, // City, State/Country
    /\b(?:in|from|at|near|around)\s+([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*)\b/g,
    /\b(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|San Francisco|Columbus|Charlotte|Fort Worth|Detroit|El Paso|Memphis|Seattle|Denver|Washington|Boston|Nashville|Baltimore|Oklahoma City|Louisville|Portland|Las Vegas|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Kansas City|Long Beach|Mesa|Atlanta|Colorado Springs|Virginia Beach|Raleigh|Omaha|Miami|Oakland|Minneapolis|Tulsa|Wichita|New Orleans|Arlington|London|Paris|Berlin|Tokyo|Sydney|Toronto|Vancouver|Montreal|Mumbai|Delhi|Shanghai|Beijing|Moscow|Dubai|Singapore|Hong Kong)\b/gi
  ];

  // Technology and product patterns
  const techPatterns = [
    /\b(iPhone|iPad|MacBook|Android|Windows|Linux|iOS|JavaScript|Python|Java|React|Angular|Vue|Node\.js|Docker|Kubernetes|AWS|Azure|GCP|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST API|Machine Learning|AI|Artificial Intelligence|Cloud Computing|Blockchain|Cryptocurrency|Bitcoin|Ethereum)\b/gi,
    /\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:API|SDK|Framework|Library|Platform|Service|Tool|Software|App|Application|System|Database|Server|Service)\b/g
  ];

  // Extract organizations
  orgPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.organizations.add(match[1] || match[0]);
    }
  });

  // Extract people
  personPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1];
      if (name && name.length > 3) {
        entities.people.add(name);
      }
    }
  });

  // Extract locations
  locationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const location = match[1] || match[0];
      if (location && location.length > 2) {
        entities.locations.add(location);
      }
    }
  });

  // Extract technologies and products
  techPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const tech = match[1] || match[0];
      if (tech && tech.length > 2) {
        entities.technologies.add(tech);
      }
    }
  });

  // Extract general proper nouns (fallback)
  const properNounPattern = /\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]+)*\b/g;
  let match;
  while ((match = properNounPattern.exec(text)) !== null) {
    const entity = match[0];
    if (entity.length > 3 && 
        !Array.from(entities.people).includes(entity) &&
        !Array.from(entities.organizations).includes(entity) &&
        !Array.from(entities.locations).includes(entity) &&
        !Array.from(entities.technologies).includes(entity)) {
      entities.misc.add(entity);
    }
  }

  // Convert sets to arrays and add confidence scores
  const result = {};
  Object.keys(entities).forEach(category => {
    result[category] = Array.from(entities[category])
      .filter(entity => entity.length > 2)
      .slice(0, 10) // Limit per category
      .map(entity => ({
        name: entity,
        confidence: calculateConfidence(entity, text, category)
      }))
      .sort((a, b) => b.confidence - a.confidence);
  });

  return result;
};

const extractKeywords = (text) => {
  // Remove common stop words and extract meaningful keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'her', 'its', 'our', 'their', 'from', 'up', 'about', 'into', 'over', 'after'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word, freq]) => ({ word, frequency: freq }));
};

const analyzeTopics = (content) => {
  const { title, headings, text } = content;
  const allText = `${title} ${headings.join(' ')} ${text}`.toLowerCase();
  
  const keywords = extractKeywords(allText);
  
  // Group keywords into topics based on common themes
  const topicPatterns = {
    'Digital Marketing': ['marketing', 'seo', 'google', 'advertising', 'campaign', 'analytics', 'conversion', 'traffic', 'keywords', 'ranking'],
    'Web Development': ['javascript', 'react', 'html', 'css', 'web', 'development', 'programming', 'code', 'frontend', 'backend', 'api'],
    'Business Strategy': ['business', 'strategy', 'growth', 'revenue', 'profit', 'sales', 'market', 'customer', 'service', 'company'],
    'Technology': ['technology', 'tech', 'software', 'app', 'platform', 'system', 'digital', 'innovation', 'data', 'cloud'],
    'Content Creation': ['content', 'blog', 'article', 'writing', 'media', 'video', 'image', 'social', 'post', 'story'],
    'E-commerce': ['shop', 'store', 'product', 'price', 'buy', 'sell', 'cart', 'payment', 'order', 'shipping'],
    'Design': ['design', 'ui', 'ux', 'interface', 'user', 'experience', 'visual', 'layout', 'graphic', 'brand']
  };

  const topics = [];
  const usedKeywords = new Set();

  Object.entries(topicPatterns).forEach(([topicName, patterns]) => {
    const matchingKeywords = keywords.filter(({ word }) => 
      patterns.some(pattern => word.includes(pattern) || pattern.includes(word))
    );

    if (matchingKeywords.length > 0) {
      const totalFreq = matchingKeywords.reduce((sum, { frequency }) => sum + frequency, 0);
      const relevance = Math.min(95, Math.round((totalFreq / keywords.length) * 100) + 20);
      
      matchingKeywords.forEach(({ word }) => usedKeywords.add(word));

      const subtopics = matchingKeywords.slice(0, 3).map(({ word, frequency }) => ({
        name: word.charAt(0).toUpperCase() + word.slice(1),
        frequency,
        relevance: Math.min(90, relevance - 10 + Math.random() * 20),
        relatedEntities: matchingKeywords.slice(0, 3).map(k => k.word.charAt(0).toUpperCase() + k.word.slice(1))
      }));

      topics.push({
        name: topicName,
        frequency: totalFreq,
        relevance,
        subtopics,
        relatedEntities: matchingKeywords.map(({ word }) => word.charAt(0).toUpperCase() + word.slice(1))
      });
    }
  });

  // Add any remaining high-frequency keywords as general topics
  const remainingKeywords = keywords.filter(({ word }) => !usedKeywords.has(word)).slice(0, 2);
  remainingKeywords.forEach(({ word, frequency }) => {
    topics.push({
      name: word.charAt(0).toUpperCase() + word.slice(1),
      frequency,
      relevance: Math.min(85, 40 + frequency * 2),
      subtopics: [],
      relatedEntities: [word.charAt(0).toUpperCase() + word.slice(1)]
    });
  });

  return topics.slice(0, 6); // Limit to 6 main topics
};

const detectPageType = (url, title, headings, content) => {
  const urlPath = url.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Blog/Article detection
  if (urlPath.includes('/blog') || urlPath.includes('/article') || urlPath.includes('/post') || 
      urlPath.includes('/news') || titleLower.includes('blog') ||
      /\d{4}\/\d{2}/.test(urlPath) || // Date pattern in URL
      contentLower.includes('published') || contentLower.includes('author')) {
    return 'blog';
  }
  
  // Product page detection
  if (urlPath.includes('/product') || urlPath.includes('/item') || urlPath.includes('/shop') ||
      contentLower.includes('price') || contentLower.includes('add to cart') ||
      contentLower.includes('buy now') || contentLower.includes('in stock')) {
    return 'product';
  }
  
  // Category/listing detection
  if (urlPath.includes('/category') || urlPath.includes('/collection') || 
      urlPath.includes('/archive') || titleLower.includes('category') ||
      contentLower.includes('filter by') || contentLower.includes('sort by')) {
    return 'category';
  }
  
  // About page detection
  if (urlPath.includes('/about') || urlPath.includes('/company') || 
      titleLower.includes('about') || titleLower.includes('company')) {
    return 'about';
  }
  
  // Contact page detection
  if (urlPath.includes('/contact') || titleLower.includes('contact') ||
      contentLower.includes('phone') || contentLower.includes('email')) {
    return 'contact';
  }
  
  // Homepage detection
  if (urlPath === '/' || urlPath === '' || titleLower.includes('home') ||
      titleLower.includes('welcome')) {
    return 'home';
  }
  
  return 'page';
};

const analyzeSEO = (content, url = '') => {
  const { title, metaDescription, headings, text, images, internalLinks, canonicalUrl, schema } = content;
  
  // Title analysis
  const titleScore = (() => {
    if (!title) return 0;
    let score = 50;
    if (title.length >= 30 && title.length <= 60) score += 30;
    else if (title.length >= 20 && title.length <= 70) score += 20;
    if (/[A-Z]/.test(title)) score += 10;
    if (title.includes('|') || title.includes('-')) score += 10;
    return Math.min(100, score);
  })();

  // Meta description analysis
  const metaScore = (() => {
    if (!metaDescription) return 0;
    let score = 40;
    if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 40;
    else if (metaDescription.length >= 100 && metaDescription.length <= 180) score += 30;
    if (/call|click|learn|discover|get|find/i.test(metaDescription)) score += 20;
    return Math.min(100, score);
  })();

  // Headings analysis
  const headingStructure = headings.map((heading, index) => {
    const level = heading.startsWith('H1') ? 1 : 
                 heading.startsWith('H2') ? 2 : 
                 heading.startsWith('H3') ? 3 : 
                 heading.startsWith('H4') ? 4 :
                 heading.startsWith('H5') ? 5 : 6;
    const text = heading.replace(/^H[1-6]:\s*/, '');
    let score = 70;
    if (text.length >= 20 && text.length <= 70) score += 20;
    if (level === 1 && index === 0) score += 10;
    return { level, text, score: Math.min(100, score) };
  });

  // Image analysis
  const imageAnalysis = {
    total: images?.length || 0,
    withAlt: images?.filter(img => img.alt && img.alt.trim()).length || 0,
    missingAlt: images?.filter(img => !img.alt || !img.alt.trim()).length || 0,
    score: images?.length > 0 ? Math.round((images.filter(img => img.alt && img.alt.trim()).length / images.length) * 100) : 100
  };

  // Internal links analysis
  const linkAnalysis = {
    total: internalLinks?.length || 0,
    withAnchor: internalLinks?.filter(link => link.text && link.text.trim()).length || 0,
    score: internalLinks?.length > 0 ? Math.round((internalLinks.filter(link => link.text && link.text.trim()).length / internalLinks.length) * 100) : 100
  };

  // Schema markup analysis
  const schemaAnalysis = {
    hasJsonLD: schema?.hasJsonLD || text.includes('application/ld+json'),
    isValid: schema?.isValid || true,
    types: schema?.types || (text.includes('"@type"') ? ['WebPage'] : []),
    score: schema?.hasJsonLD || text.includes('application/ld+json') ? 100 : 0
  };

  // Technical SEO
  const technicalSEO = {
    hasCanonical: !!canonicalUrl,
    canonicalUrl: canonicalUrl || '',
    score: canonicalUrl ? 100 : 50
  };

  // Page type detection
  const pageType = detectPageType(url, title, headings, text);

  const overallScore = Math.round((
    titleScore + 
    metaScore + 
    (headingStructure.length > 0 ? headingStructure.reduce((sum, h) => sum + h.score, 0) / headingStructure.length : 50) +
    imageAnalysis.score +
    linkAnalysis.score +
    schemaAnalysis.score +
    technicalSEO.score
  ) / 7);

  return {
    score: overallScore,
    pageType,
    title: {
      score: titleScore,
      length: title?.length || 0,
      hasKeywords: title ? /seo|marketing|web|business|service/i.test(title) : false,
      text: title || ''
    },
    meta: {
      score: metaScore,
      length: metaDescription?.length || 0,
      hasCTA: metaDescription ? /call|click|learn|discover|get|find/i.test(metaDescription) : false,
      text: metaDescription || ''
    },
    headings: headingStructure,
    images: imageAnalysis,
    internalLinks: linkAnalysis,
    schema: schemaAnalysis,
    technical: technicalSEO,
    issues: [
      ...(titleScore < 70 ? ['Title tag needs optimization'] : []),
      ...(metaScore < 70 ? ['Meta description needs improvement'] : []),
      ...(imageAnalysis.missingAlt > 0 ? [`${imageAnalysis.missingAlt} images missing alt text`] : []),
      ...(headingStructure.filter(h => h.level === 1).length === 0 ? ['Missing H1 tag'] : []),
      ...(headingStructure.filter(h => h.level === 1).length > 1 ? ['Multiple H1 tags found'] : []),
      ...(!schemaAnalysis.hasJsonLD ? ['Missing structured data markup'] : []),
      ...(!technicalSEO.hasCanonical ? ['Missing canonical URL'] : [])
    ],
    recommendations: [
      'Optimize title tag length and keyword placement',
      'Write compelling meta descriptions with clear CTAs',
      'Implement proper heading hierarchy (H1-H6)',
      'Add alt text to all images for accessibility',
      'Include relevant internal links with descriptive anchor text',
      'Add JSON-LD structured data markup',
      'Implement canonical URLs to prevent duplicate content'
    ]
  };
};

const extractPageContent = (doc, url) => {
  // Extract basic SEO elements
  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const canonicalUrl = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  
  // Extract headings
  const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headings = Array.from(headingElements).map(h => 
    `${h.tagName}: ${h.textContent.trim()}`
  ).filter(h => h.length > 3);

  // Extract images with alt text
  const imageElements = doc.querySelectorAll('img');
  const images = Array.from(imageElements).map(img => ({
    src: img.src || img.getAttribute('src') || '',
    alt: img.alt || '',
    title: img.title || ''
  }));

  // Extract internal links
  const linkElements = doc.querySelectorAll('a[href]');
  const baseUrl = new URL(url);
  const internalLinks = Array.from(linkElements)
    .map(link => ({
      href: link.href,
      text: link.textContent.trim(),
      title: link.title || ''
    }))
    .filter(link => {
      try {
        const linkUrl = new URL(link.href);
        return linkUrl.hostname === baseUrl.hostname;
      } catch {
        return false;
      }
    });

  // Extract structured data
  const jsonLdElements = doc.querySelectorAll('script[type="application/ld+json"]');
  const schema = {
    hasJsonLD: jsonLdElements.length > 0,
    isValid: true,
    types: []
  };

  if (jsonLdElements.length > 0) {
    try {
      Array.from(jsonLdElements).forEach(script => {
        const data = JSON.parse(script.textContent);
        if (data['@type']) {
          schema.types.push(data['@type']);
        }
      });
    } catch (e) {
      schema.isValid = false;
    }
  }

  // Extract main text content (avoiding nav, footer, ads)
  const contentSelectors = [
    'main', 'article', '.content', '.post', '.entry',
    '[role="main"]', '.main-content', '#content'
  ];
  
  let mainContent = '';
  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      mainContent = element.textContent.trim();
      break;
    }
  }
  
  // Fallback to body content if no main content found
  if (!mainContent) {
    const textElements = doc.querySelectorAll('p, div, article, section');
    mainContent = Array.from(textElements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 20)
      .join(' ');
  }
  
  const text = mainContent.slice(0, 5000); // Limit text for analysis

  return {
    title,
    metaDescription,
    canonicalUrl,
    headings,
    images,
    internalLinks,
    schema,
    text
  };
};

const findLinkedPages = (doc, baseUrl, maxPages = 25) => {
  const links = new Set();
  const linkElements = doc.querySelectorAll('a[href]');
  
  Array.from(linkElements).forEach(link => {
    try {
      const href = link.getAttribute('href');
      if (!href) return;
      
      let absoluteUrl;
      if (href.startsWith('http')) {
        absoluteUrl = href;
      } else if (href.startsWith('/')) {
        absoluteUrl = new URL(href, baseUrl).href;
      } else {
        absoluteUrl = new URL(href, baseUrl).href;
      }
      
      const url = new URL(absoluteUrl);
      const base = new URL(baseUrl);
      
      // Only include same domain links
      if (url.hostname === base.hostname) {
        // Filter out common non-content URLs
        const path = url.pathname.toLowerCase();
        if (!path.includes('/admin') && 
            !path.includes('/login') && 
            !path.includes('/register') &&
            !path.includes('/cart') &&
            !path.includes('/checkout') &&
            !path.includes('/search') &&
            !path.includes('.xml') &&
            !path.includes('.pdf') &&
            !path.includes('.jpg') &&
            !path.includes('.png') &&
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:')) {
          links.add(absoluteUrl);
          
          if (links.size >= maxPages) {
            return;
          }
        }
      }
    } catch (e) {
      // Skip invalid URLs
    }
  });
  
  return Array.from(links).slice(0, maxPages);
};

const performSemanticAnalysis = async (url, onProgress) => {
  try {
    const pages = [];
    const crawledUrls = new Set();
    const maxPages = 25;
    let currentPage = 0;
    
    // Start with the main URL
    const urlQueue = [url];
    
    while (urlQueue.length > 0 && pages.length < maxPages) {
      const currentUrl = urlQueue.shift();
      if (crawledUrls.has(currentUrl)) continue;
      
      crawledUrls.add(currentUrl);
      currentPage++;
      
      // Progress callback for UI updates
      if (onProgress) {
        onProgress({
          current: currentPage,
          total: Math.min(urlQueue.length + currentPage + 5, maxPages),
          url: currentUrl,
          status: 'crawling'
        });
      }
      
      try {
        // Use CORS proxy to fetch page content
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(currentUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const html = data.contents;

        // Parse HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract comprehensive page content
        const pageContent = extractPageContent(doc, currentUrl);
        
        // Find additional pages to crawl (only from homepage initially)
        if (currentPage === 1) {
          const linkedPages = findLinkedPages(doc, url, maxPages - 1);
          linkedPages.forEach(linkedUrl => {
            if (!crawledUrls.has(linkedUrl) && urlQueue.length + pages.length < maxPages) {
              urlQueue.push(linkedUrl);
            }
          });
        }

        // Analyze the page content
        const topics = analyzeTopics(pageContent);
        const entities = extractEntities(pageContent.text);
        const seoMetrics = analyzeSEO(pageContent, currentUrl);

        pages.push({
          url: currentUrl,
          content: pageContent,
          topics,
          entities,
          seoMetrics,
          crawledAt: new Date().toISOString()
        });

        // Brief delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.warn(`Error processing ${currentUrl}:`, error.message);
        continue;
      }
    }

    if (pages.length === 0) {
      throw new Error('No pages could be successfully crawled and analyzed');
    }

    // Aggregate results across all pages
    const allTopics = pages.flatMap(page => page.topics);
    const allEntities = pages.flatMap(page => 
      Array.isArray(page.entities) ? page.entities : 
      Object.values(page.entities || {}).flat()
    );

    // Merge and deduplicate topics
    const topicMap = new Map();
    allTopics.forEach(topic => {
      const existing = topicMap.get(topic.name);
      if (existing) {
        existing.frequency += topic.frequency;
        existing.relevance = Math.max(existing.relevance, topic.relevance);
        existing.pages = [...new Set([...existing.pages, topic.url])];
      } else {
        topicMap.set(topic.name, {
          ...topic,
          pages: [pages.find(p => p.topics.includes(topic))?.url].filter(Boolean)
        });
      }
    });

    // Merge and categorize entities
    const entityMap = new Map();
    allEntities.forEach(entity => {
      const entityName = typeof entity === 'string' ? entity : entity.name;
      if (entityMap.has(entityName)) {
        entityMap.get(entityName).count++;
      } else {
        entityMap.set(entityName, {
          name: entityName,
          count: 1,
          confidence: typeof entity === 'object' ? entity.confidence : 0.8
        });
      }
    });

    // Calculate overall SEO score
    const avgSeoScore = Math.round(
      pages.reduce((sum, page) => sum + page.seoMetrics.score, 0) / pages.length
    );

    // Generate comprehensive URL suggestions
    const topTopics = Array.from(topicMap.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    const urlSuggestions = topTopics
      .map(topic => topic.name.toLowerCase().replace(/\s+/g, '-'))
      .concat(
        pages.map(page => {
          const pathParts = new URL(page.url).pathname.split('/').filter(Boolean);
          return pathParts.join('/');
        }).filter(Boolean)
      )
      .slice(0, 15);

    // Page type summary
    const pageTypes = {};
    pages.forEach(page => {
      const type = page.seoMetrics.pageType;
      pageTypes[type] = (pageTypes[type] || 0) + 1;
    });

    return {
      pages,
      topics: Array.from(topicMap.values()),
      entities: Array.from(entityMap.values()),
      seoMetrics: {
        score: avgSeoScore,
        pageCount: pages.length,
        pageTypes,
        issues: pages.flatMap(page => page.seoMetrics.issues),
        recommendations: [
          'Optimize page titles and meta descriptions across all pages',
          'Implement consistent heading hierarchy site-wide',
          'Add missing alt text to images',
          'Improve internal linking structure',
          'Add structured data markup to key pages',
          'Ensure all pages have canonical URLs'
        ]
      },
      urlSuggestions,
      crawlSummary: {
        totalPages: pages.length,
        crawledAt: new Date().toISOString(),
        domain: new URL(url).hostname,
        pageTypes
      }
    };

  } catch (error) {
    console.error('Multi-page analysis error:', error);
    throw new Error(`Unable to crawl and analyze website: ${error.message}`);
  }
};

export const analysisService = {
  async getAll() {
    await delay(300);
    return [...mockAnalyses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const analysis = mockAnalyses.find(item => item.id === id);
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    return { ...analysis };
  },

async analyzeUrl(input, inputMode = 'url') {
await delay(1500); // Reduced delay for real analysis

    if (inputMode === 'url') {
      try {
        // Validate URL
        const urlObj = new URL(input);
        
        // Ensure URL has protocol
        if (!urlObj.protocol.startsWith('http')) {
          throw new Error("URL must use HTTP or HTTPS protocol");
        }
      } catch {
        throw new Error("Invalid URL format. Please include http:// or https://");
      }

      try {
        // Progress tracking for multi-page crawling
        let crawlProgress = null;
        const onProgress = (progress) => {
          crawlProgress = progress;
        };

        // Perform comprehensive semantic analysis with crawling
        const analysisResults = await performSemanticAnalysis(input, onProgress);
        
        // Create new analysis record
        const newAnalysis = {
          id: Math.max(...mockAnalyses.map(a => a.id), 0) + 1,
          url: input,
          timestamp: new Date().toISOString(),
          ...analysisResults
        };

        // Add to mock data
        mockAnalyses.unshift(newAnalysis);
        return { ...newAnalysis };
      } catch (error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error("Unable to access the website. It may be blocking automated requests or be temporarily unavailable.");
        } else if (error.message.includes('CORS')) {
          throw new Error("The website is blocking cross-origin requests. This is a browser security limitation.");
        } else {
          throw new Error(error.message || "Failed to crawl and analyze website content. Please try again.");
        }
      }
    } else {
      // Analyze direct text content
      try {
        const content = {
          title: "Direct Content Analysis",
          metaDescription: "Analysis of provided text content",
          headings: [],
          text: input
        };

        // Perform topic analysis on text
        const topics = analyzeTopics(content);
        
        // Enhanced entity extraction with categorization
        const entities = extractEntities(input);
        
        // Basic SEO analysis for text content
        const seoMetrics = {
          score: Math.min(Math.max(input.length / 50, 0.3), 1.0), // Based on content length
          issues: input.length < 100 ? ["Content too short for comprehensive analysis"] : [],
          recommendations: [
            "Consider structuring content with clear headings",
            "Ensure key entities are properly emphasized",
            "Add more descriptive context around important terms"
          ]
        };

        // Generate topic-based suggestions
        const urlSuggestions = topics
          .slice(0, 5)
          .map(topic => topic.name.toLowerCase().replace(/\s+/g, '-'))
          .concat(['content-analysis', 'text-insights', 'entity-extraction']);

        const newAnalysis = {
          id: Math.max(...mockAnalyses.map(a => a.id), 0) + 1,
          url: "Direct Content Analysis",
          timestamp: new Date().toISOString(),
          topics,
          entities,
          seoMetrics,
          urlSuggestions,
          contentType: 'text'
        };

        mockAnalyses.unshift(newAnalysis);
        return { ...newAnalysis };
      } catch (error) {
        throw new Error("Failed to analyze text content. Please try again.");
      }
    }
  },

  // Legacy method for URL-only analysis (for backward compatibility)
  async analyzeUrlLegacy(url) {
    return this.analyzeUrl(url, 'url');
  },

  async analyzeUrlOriginal(url) {
    await delay(1500);

    try {
      // Validate URL
      const urlObj = new URL(url);
      
      // Ensure URL has protocol
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error("URL must use HTTP or HTTPS protocol");
      }
    } catch {
      throw new Error("Invalid URL format. Please include http:// or https://");
    }

    try {
      // Perform real semantic analysis
const analysisResults = await performSemanticAnalysis(url);
      
      // Create new analysis record
      const newAnalysis = {
        id: Math.max(...mockAnalyses.map(a => a.id), 0) + 1,
        url,
        timestamp: new Date().toISOString(),
        ...analysisResults
      };

      // Add to mock data (in real app, this would be saved to backend)
      mockAnalyses.unshift(newAnalysis);

      return { ...newAnalysis };
    } catch (error) {
      // Handle specific network and parsing errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error("Unable to access the website. It may be blocking automated requests or be temporarily unavailable.");
      } else if (error.message.includes('CORS')) {
        throw new Error("The website is blocking cross-origin requests. This is a browser security limitation.");
      } else {
        throw new Error(error.message || "Failed to analyze website content. Please try again.");
      }
    }
  },

  async create(analysisData) {
    await delay(400);
    const newAnalysis = {
      id: Math.max(...mockAnalyses.map(a => a.id), 0) + 1,
      timestamp: new Date().toISOString(),
      ...analysisData
    };
    mockAnalyses.unshift(newAnalysis);
    return { ...newAnalysis };
  },

  async update(id, updateData) {
    await delay(300);
    const index = mockAnalyses.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error("Analysis not found");
    }
    
    mockAnalyses[index] = { ...mockAnalyses[index], ...updateData };
    return { ...mockAnalyses[index] };
  },

  async delete(id) {
    await delay(250);
    const index = mockAnalyses.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error("Analysis not found");
    }
    
    const deletedAnalysis = mockAnalyses.splice(index, 1)[0];
    return { ...deletedAnalysis };
  }
};