import mockAnalyses from "@/services/mockData/analyses.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock NLP analysis function
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

const analyzeSEO = (content) => {
  const { title, metaDescription, headings, text } = content;
  
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
                 heading.startsWith('H3') ? 3 : 2;
    const text = heading.replace(/^H[1-6]:\s*/, '');
    let score = 70;
    if (text.length >= 20 && text.length <= 70) score += 20;
    if (level === 1 && index === 0) score += 10;
    return { level, text, score: Math.min(100, score) };
  });

  const overallScore = Math.round((titleScore + metaScore + (headingStructure.length > 0 ? headingStructure.reduce((sum, h) => sum + h.score, 0) / headingStructure.length : 50)) / 3);

  return {
    score: overallScore,
    title: {
      score: titleScore,
      length: title?.length || 0,
      hasKeywords: title ? /seo|marketing|web|business|service/i.test(title) : false
    },
    meta: {
      score: metaScore,
      length: metaDescription?.length || 0,
      hasCTA: metaDescription ? /call|click|learn|discover|get|find/i.test(metaDescription) : false
    },
    headings: headingStructure,
    schema: {
      hasJsonLD: text.includes('application/ld+json'),
      isValid: true,
      types: text.includes('"@type"') ? ['WebPage'] : []
    }
  };
};

const performSemanticAnalysis = async (url) => {
  try {
    // Use a CORS proxy service to fetch the website content
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract content
    const title = doc.querySelector('title')?.textContent?.trim() || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract headings
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings = Array.from(headingElements).map(h => 
      `${h.tagName}: ${h.textContent.trim()}`
    ).filter(h => h.length > 3);

    // Extract main text content
    const textElements = doc.querySelectorAll('p, div, article, section');
    const text = Array.from(textElements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 20)
      .join(' ')
      .slice(0, 5000); // Limit text for analysis

    const content = { title, metaDescription, headings, text };

    // Perform topic analysis
    const topics = analyzeTopics(content);
    
    // Extract entities (capitalized words that appear multiple times)
    const entityMatches = text.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
    const entityFreq = {};
    entityMatches.forEach(entity => {
      if (entity.length > 2) {
        entityFreq[entity] = (entityFreq[entity] || 0) + 1;
      }
    });
    
    const entities = Object.entries(entityFreq)
      .filter(([, freq]) => freq > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([entity]) => entity);

    // Perform SEO analysis
    const seoMetrics = analyzeSEO(content);

    // Generate URL suggestions based on actual topics
    const urlSuggestions = topics
      .slice(0, 8)
      .map(topic => topic.name.toLowerCase().replace(/\s+/g, '-'))
      .concat(
        topics.slice(0, 3).flatMap(topic =>
          topic.subtopics.slice(0, 2).map(sub =>
            `${topic.name.toLowerCase().replace(/\s+/g, '-')}/${sub.name.toLowerCase().replace(/\s+/g, '-')}`
          )
        )
      )
      .slice(0, 10);

    return {
      topics,
      entities,
      seoMetrics,
      urlSuggestions
    };

  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Unable to analyze website content: ${error.message}`);
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

async analyzeUrl(url) {
    await delay(1500); // Reduced delay for real analysis

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