import mockAnalyses from "@/services/mockData/analyses.json";
import React from "react";
import Error from "@/components/ui/Error";
// Optimized minimal delay for better performance
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock NLP analysis function
// Extract meaningful context snippets for topics
const extractTopicContext = (topic, text, maxContexts = 3) => {
  const contexts = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  for (const sentence of sentences) {
    if (contexts.length >= maxContexts) break;
    const words = topic.toLowerCase().split(' ');
    if (words.some(word => sentence.toLowerCase().includes(word))) {
      contexts.push(sentence.trim().substring(0, 150) + (sentence.length > 150 ? '...' : ''));
    }
  }
  
  return contexts;
};

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
// Detect website's primary domain niche for relevance scoring
const detectDomainNiche = (allContent) => {
  const nichePatterns = {
    'Technology': ['tech', 'software', 'development', 'programming', 'digital', 'innovation', 'startup', 'saas', 'api', 'platform'],
    'E-commerce': ['shop', 'store', 'product', 'buy', 'sell', 'cart', 'payment', 'retail', 'marketplace', 'commerce'],
    'Healthcare': ['health', 'medical', 'doctor', 'patient', 'treatment', 'wellness', 'care', 'medicine', 'therapy'],
    'Education': ['education', 'learning', 'course', 'student', 'teach', 'training', 'university', 'school', 'academic'],
    'Finance': ['finance', 'money', 'investment', 'banking', 'loan', 'insurance', 'financial', 'credit', 'payment'],
    'Marketing': ['marketing', 'advertising', 'campaign', 'brand', 'social media', 'seo', 'digital marketing', 'promotion'],
    'Business Services': ['business', 'service', 'consulting', 'professional', 'management', 'strategy', 'corporate', 'enterprise'],
    'Real Estate': ['real estate', 'property', 'home', 'house', 'apartment', 'rent', 'buy', 'mortgage', 'listing'],
    'Travel': ['travel', 'hotel', 'vacation', 'booking', 'flight', 'tourism', 'destination', 'trip', 'resort'],
    'Food & Dining': ['food', 'restaurant', 'recipe', 'cooking', 'dining', 'menu', 'cuisine', 'chef', 'delivery']
  };

  const nicheScores = {};
  const combinedText = allContent.toLowerCase();

  Object.entries(nichePatterns).forEach(([niche, patterns]) => {
    let score = 0;
    patterns.forEach(pattern => {
      const matches = (combinedText.match(new RegExp(pattern, 'gi')) || []).length;
      score += matches;
    });
    nicheScores[niche] = score;
  });

  const topNiche = Object.entries(nicheScores).reduce((a, b) => 
    nicheScores[a[0]] > nicheScores[b[0]] ? a : b
  );

  return {
    primary: topNiche[0],
    score: topNiche[1],
    all: nicheScores
  };
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
// Optimized entity filtering with Set.has() for O(1) lookup
    if (entity.length > 3 && 
        !entities.people.has(entity) &&
        !entities.organizations.has(entity) &&
        !entities.locations.has(entity) &&
        !entities.technologies.has(entity)) {
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

const analyzeTopics = (content, url, domainNiche = null) => {
  // Enhanced NLP entity detection with categorization
  const detectNamedEntities = (text) => {
    const entities = {
      PERSON: [],
      ORGANIZATION: [],
      PRODUCT: [],
      LOCATION: [],
      OTHER: []
    };

    // Person name patterns (enhanced detection)
    const personPatterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g, // Full names
      /\b(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.|CEO|CTO|CMO|President)\s+([A-Z][a-z]+ [A-Z][a-z]+)\b/g, // Titles + names
      /\b([A-Z][a-z]+)\s+(founded|created|developed|designed|built|invented)\b/g, // Creator patterns
    ];

    // Organization patterns (enhanced)
    const orgPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Inc\.|LLC|Corp\.|Corporation|Company|Ltd\.|Limited|Foundation|Institute|University|College)\b/g,
      /\b(Google|Microsoft|Apple|Amazon|Facebook|Meta|Twitter|LinkedIn|Instagram|TikTok|YouTube|Netflix|Spotify|Airbnb|Uber|Tesla|OpenAI|GitHub|Slack|Zoom|Shopify|WordPress|Salesforce|Oracle|IBM|Intel|NVIDIA|AMD)\b/g,
      /\b([A-Z]{2,})\s+(API|SDK|Platform|Service|Cloud|Analytics|Ads|Business|Developer|Enterprise)\b/g
    ];

    // Product/Service patterns (enhanced)
    const productPatterns = [
      /\b(ChatGPT|GPT-4|BERT|TensorFlow|React|Vue\.js|Angular|Node\.js|Python|JavaScript|TypeScript|HTML5|CSS3|WordPress|Shopify|WooCommerce|Magento|Drupal)\b/g,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(API|SDK|Framework|Library|Tool|Platform|Software|App|Application|Plugin|Extension|Widget|CMS|CRM|ERP)\b/g,
      /\b(iPhone|iPad|Android|Windows|macOS|Linux|Chrome|Firefox|Safari|Edge)\b/g
    ];

    // Location patterns (enhanced)
    const locationPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+(CA|NY|TX|FL|WA|IL|PA|OH|GA|NC|MI|NJ|VA|WA|AZ|MA|TN|IN|MO|MD|WI|CO|MN|SC|AL|LA|KY|OR|OK|CT|UT|IA|NV|AR|MS|KS|NM|NE|WV|ID|HI|ME|NH|RI|MT|DE|SD|ND|AK|VT|WY)\b/g, // US Cities
      /\b(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|Nashville|Detroit|Portland|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Long Beach|Kansas City|Mesa|Atlanta|Colorado Springs|Virginia Beach|Raleigh|Omaha|Miami|Oakland|Minneapolis|Tulsa|Wichita|New Orleans|Arlington|Cleveland|Tampa|Bakersfield|Aurora|Honolulu|Anaheim|Santa Ana|Corpus Christi|Riverside|Lexington|St. Louis|Stockton|Pittsburgh|Saint Paul|Cincinnati|Anchorage|Henderson|Greensboro|Plano|Newark|Toledo|Lincoln|Orlando|Chula Vista|Jersey City|Chandler|Buffalo|Durham|St. Petersburg|Irvine|Laredo|Lubbock|Gilbert|Winston-Salem|Glendale|Reno|Hialeah|Garland|Chesapeake|Irving|North Las Vegas|Scottsdale|Baton Rouge|Fremont|Richmond|Boise|San Bernardino)\b/g, // Major US cities
      /\b(United States|USA|UK|United Kingdom|Canada|Australia|Germany|France|Italy|Spain|Japan|China|India|Brazil|Mexico|Russia|South Korea|Netherlands|Sweden|Norway|Denmark|Finland|Switzerland|Austria|Belgium|Portugal|Ireland|New Zealand|Singapore|Hong Kong|Taiwan|Thailand|Malaysia|Indonesia|Philippines|Vietnam|South Africa|Egypt|Israel|UAE|Saudi Arabia|Turkey|Greece|Poland|Czech Republic|Hungary|Romania|Bulgaria|Croatia|Serbia|Slovenia|Slovakia|Estonia|Latvia|Lithuania|Ukraine|Belarus|Moldova|Georgia|Armenia|Azerbaijan|Kazakhstan|Uzbekistan|Kyrgyzstan|Tajikistan|Turkmenistan|Afghanistan|Pakistan|Bangladesh|Sri Lanka|Nepal|Bhutan|Myanmar|Cambodia|Laos|Mongolia|North Korea|Iran|Iraq|Jordan|Lebanon|Syria|Yemen|Oman|Qatar|Bahrain|Kuwait|Cyprus|Malta|Iceland|Greenland|Faroe Islands|Andorra|Monaco|Liechtenstein|San Marino|Vatican City|Luxembourg|Albania|Macedonia|Bosnia and Herzegovina|Montenegro|Kosovo)\b/g // Countries
    ];

    // Extract persons
    personPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const entity = match[1] || match[2] || match[0];
        if (entity && entity.length > 3 && !entities.PERSON.some(p => p === entity)) {
          entities.PERSON.push(entity);
        }
      }
    });

    // Extract organizations
    orgPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const entity = match[1] || match[0];
        if (entity && entity.length > 2 && !entities.ORGANIZATION.some(o => o === entity)) {
          entities.ORGANIZATION.push(entity);
        }
      }
    });

    // Extract products
    productPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const entity = match[1] || match[0];
        if (entity && entity.length > 2 && !entities.PRODUCT.some(p => p === entity)) {
          entities.PRODUCT.push(entity);
        }
      }
    });

    // Extract locations
    locationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const entity = match[1] || match[0];
        if (entity && entity.length > 2 && !entities.LOCATION.some(l => l === entity)) {
          entities.LOCATION.push(entity);
        }
      }
    });

    return entities;
  };

  // Enhanced subtopic detection using semantic relationships
  const detectSubtopics = (mainTopic, keywords, entities) => {
    const subtopics = [];
    const mainTopicWords = mainTopic.toLowerCase().split(' ');
    
    // Find semantically related keywords
    const relatedKeywords = keywords.filter(k => {
      const keywordWords = k.word.toLowerCase().split(' ');
      // Check for semantic relationships
      const isRelated = mainTopicWords.some(mainWord => 
        keywordWords.some(keyWord => 
          keyWord.includes(mainWord) || 
          mainWord.includes(keyWord) ||
          // Domain-specific semantic relationships
          (mainWord === 'ai' && ['machine', 'learning', 'neural', 'deep', 'algorithm'].includes(keyWord)) ||
          (mainWord === 'marketing' && ['content', 'social', 'digital', 'advertising', 'campaign'].includes(keyWord)) ||
          (mainWord === 'development' && ['programming', 'coding', 'framework', 'library', 'api'].includes(keyWord)) ||
          (mainWord === 'seo' && ['keyword', 'ranking', 'optimization', 'search', 'google'].includes(keyWord))
        )
      );
      return isRelated && k.frequency >= 5; // Minimum frequency threshold
    });

    // Group related keywords into subtopics
    const topicGroups = {};
    relatedKeywords.forEach(keyword => {
      const keywordLower = keyword.word.toLowerCase();
      let groupKey = null;
      
      // Find existing group or create new one
      Object.keys(topicGroups).forEach(key => {
        if (keywordLower.includes(key) || key.includes(keywordLower)) {
          groupKey = key;
        }
      });
      
      if (!groupKey) {
        groupKey = keywordLower;
        topicGroups[groupKey] = [];
      }
      
      topicGroups[groupKey].push(keyword);
    });

    // Convert groups to subtopics
    Object.entries(topicGroups).forEach(([groupKey, keywords]) => {
      if (keywords.length >= 2) { // At least 2 related keywords
        const totalFreq = keywords.reduce((sum, k) => sum + k.frequency, 0);
        const avgRelevance = keywords.reduce((sum, k) => sum + (k.relevance || 50), 0) / keywords.length;
        
        subtopics.push({
          name: keywords[0].word.charAt(0).toUpperCase() + keywords[0].word.slice(1),
          frequency: totalFreq,
          relevance: Math.min(95, avgRelevance + 10), // Boost subtopic relevance
          relatedEntities: [
            ...new Set([
              ...keywords.slice(0, 3).map(k => k.word.charAt(0).toUpperCase() + k.word.slice(1)),
              ...Object.values(entities).flat().filter(e => 
                e.toLowerCase().includes(groupKey) || groupKey.includes(e.toLowerCase())
              ).slice(0, 2)
            ])
          ],
          contextExamples: extractTopicContext(groupKey, content.text, 2)
        });
      }
    });

return subtopics.slice(0, 5); // Limit to top 5 subtopics
  };
  const { title, headings, text } = content;
  const allText = `${title} ${headings.join(' ')} ${text}`.toLowerCase();
  const fullText = `${title}. ${headings.join('. ')}. ${text}`;
  
  // Extract named entities for the page
  const namedEntities = detectNamedEntities(fullText);
  
  // Enhanced topic patterns with domain-specific weighting
  const topicPatterns = {
    'Digital Marketing': ['marketing', 'seo', 'google', 'advertising', 'campaign', 'analytics', 'conversion', 'traffic', 'keywords', 'ranking', 'social media', 'ppc', 'sem'],
    'Web Development': ['javascript', 'react', 'html', 'css', 'web', 'development', 'programming', 'code', 'frontend', 'backend', 'api', 'framework', 'responsive'],
    'Business Strategy': ['business', 'strategy', 'growth', 'revenue', 'profit', 'sales', 'market', 'customer', 'service', 'company', 'management', 'leadership'],
    'Technology & Innovation': ['technology', 'tech', 'software', 'app', 'platform', 'system', 'digital', 'innovation', 'data', 'cloud', 'ai', 'automation'],
    'Content Creation': ['content', 'blog', 'article', 'writing', 'media', 'video', 'image', 'social', 'post', 'story', 'copywriting', 'editorial'],
    'E-commerce': ['shop', 'store', 'product', 'price', 'buy', 'sell', 'cart', 'payment', 'order', 'shipping', 'retail', 'marketplace'],
    'User Experience': ['design', 'ui', 'ux', 'interface', 'user', 'experience', 'visual', 'layout', 'graphic', 'brand', 'usability', 'accessibility'],
    'Data & Analytics': ['data', 'analytics', 'metrics', 'tracking', 'insights', 'reporting', 'dashboard', 'kpi', 'measurement', 'statistics'],
    'Security & Privacy': ['security', 'privacy', 'protection', 'encryption', 'compliance', 'gdpr', 'ssl', 'authentication', 'authorization'],
    'Performance & Optimization': ['performance', 'optimization', 'speed', 'loading', 'efficiency', 'scalability', 'caching', 'compression']
  };

  const topics = [];
  const usedKeywords = new Set();

  Object.entries(topicPatterns).forEach(([topicName, patterns]) => {
    const matchingKeywords = keywords.filter(({ word }) => 
      patterns.some(pattern => word.includes(pattern) || pattern.includes(word))
    );

    if (matchingKeywords.length > 0) {
      const totalFreq = matchingKeywords.reduce((sum, { frequency }) => sum + frequency, 0);
      let baseRelevance = Math.min(95, Math.round((totalFreq / keywords.length) * 100) + 20);
      
      // Domain-specific relevance boost
      if (domainNiche && domainNiche.primary) {
        const nicheBoosts = {
          'Technology': ['Technology & Innovation', 'Web Development', 'Data & Analytics', 'Security & Privacy'],
          'Marketing': ['Digital Marketing', 'Content Creation', 'Data & Analytics'],
          'E-commerce': ['E-commerce', 'User Experience', 'Performance & Optimization'],
          'Business Services': ['Business Strategy', 'Data & Analytics', 'Performance & Optimization']
        };
        
        const relevantTopics = nicheBoosts[domainNiche.primary] || [];
        if (relevantTopics.includes(topicName)) {
          baseRelevance = Math.min(98, baseRelevance + 15);
        }
      }
      
      matchingKeywords.forEach(({ word }) => usedKeywords.add(word));

      // Extract context examples
      const contextExamples = extractTopicContext(topicName, fullText, 2);
      
      const subtopics = matchingKeywords.slice(0, 3).map(({ word, frequency }) => ({
name: word.charAt(0).toUpperCase() + word.slice(1),
        frequency,
        relevance: Math.min(90, baseRelevance - 10 + Math.random() * 20),
        relatedEntities: matchingKeywords.slice(0, 3).map(k => k.word.charAt(0).toUpperCase() + k.word.slice(1)),
        contextExamples: extractTopicContext(topicName, content.text, 3),
        entities: namedEntities // Add detected entities to subtopics
      }));

// Enhanced subtopic detection
      const enhancedSubtopics = detectSubtopics(topicName, matchingKeywords, namedEntities);
      
      topics.push({
        name: topicName,
        frequency: totalFreq,
        relevance: baseRelevance,
        subtopics: enhancedSubtopics,
        relatedEntities: matchingKeywords.map(({ word }) => word.charAt(0).toUpperCase() + word.slice(1)),
        contextExamples,
        sourceUrl: url,
        pages: [url], // Track which pages contain this topic
        entities: namedEntities, // Add categorized entities
        entityFrequency: Object.fromEntries(
          Object.entries(namedEntities).map(([category, entities]) => [
            category, 
            entities.reduce((freq, entity) => {
              const entityFreq = (content.text.match(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
              freq[entity] = entityFreq;
              return freq;
            }, {})
          ])
        )
      });
    }
  });

  // Add any remaining high-frequency keywords as general topics
  const remainingKeywords = keywords.filter(({ word }) => !usedKeywords.has(word)).slice(0, 2);
  remainingKeywords.forEach(({ word, frequency }) => {
    const contextExamples = extractTopicContext(word, fullText, 1);
    
    topics.push({
name: word.charAt(0).toUpperCase() + word.slice(1),
      frequency,
      relevance: Math.min(85, 40 + frequency * 2),
      subtopics: [],
      relatedEntities: [word.charAt(0).toUpperCase() + word.slice(1)],
      contextExamples: extractTopicContext(word, content.text, 2),
      entities: namedEntities, // Add entities to standalone topics
      entityFrequency: Object.fromEntries(
        Object.entries(namedEntities).map(([category, entities]) => [
          category,
          entities.reduce((freq, entity) => {
            const entityFreq = (content.text.match(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
            freq[entity] = entityFreq;
            return freq;  
          }, {})
        ])
      ),
      sourceUrl: url,
      pages: [url]
    });
  });

  return topics.slice(0, 8); // Increased to 8 main topics
};

// Generate semantic clusters from topics
const generateSemanticClusters = (allTopics, domainNiche) => {
  const clusters = new Map();
  
  // Define semantic relationships based on common domain patterns
  const semanticGroups = {
    'Technology': ['artificial intelligence', 'machine learning', 'web development', 'programming', 'software', 'tech', 'digital', 'automation', 'ai', 'development'],
    'Marketing': ['marketing', 'advertising', 'content', 'seo', 'social media', 'brand', 'campaign', 'promotion', 'engagement', 'conversion'],
    'Business': ['business', 'strategy', 'management', 'growth', 'revenue', 'sales', 'enterprise', 'corporate', 'leadership', 'innovation'],
    'Content Creation': ['content', 'writing', 'copywriting', 'blogging', 'editorial', 'publishing', 'media', 'storytelling', 'creative'],
    'Analytics & Metrics': ['analytics', 'metrics', 'data', 'tracking', 'measurement', 'performance', 'insights', 'reporting', 'kpi'],
    'User Experience': ['user experience', 'ux', 'ui', 'design', 'interface', 'usability', 'accessibility', 'user journey', 'interaction']
  };

  // Group topics into semantic clusters
  allTopics.forEach(topic => {
    let assigned = false;
    const topicLower = topic.name.toLowerCase();
    
    for (const [groupName, keywords] of Object.entries(semanticGroups)) {
      if (keywords.some(keyword => topicLower.includes(keyword) || keyword.includes(topicLower))) {
        if (!clusters.has(groupName)) {
          clusters.set(groupName, {
            name: groupName,
            topics: [],
            totalMentions: 0,
            avgRelevance: 0,
            uniqueEntities: new Set(),
            pageSpread: new Set(),
            contextExamples: []
          });
        }
        
        const cluster = clusters.get(groupName);
        cluster.topics.push(topic);
        cluster.totalMentions += topic.totalMentions || topic.frequency || 0;
        cluster.uniqueEntities = new Set([...cluster.uniqueEntities, ...(topic.relatedEntities || [])]);
        
        if (topic.pageCount) cluster.pageSpread.add(topic.pageCount);
        if (topic.contextExamples) cluster.contextExamples.push(...topic.contextExamples.slice(0, 1));
        
        assigned = true;
        break;
      }
    }
    
    // Create 'Other' cluster for unassigned topics
    if (!assigned) {
      const otherCluster = 'Domain Specific';
      if (!clusters.has(otherCluster)) {
        clusters.set(otherCluster, {
          name: otherCluster,
          topics: [],
          totalMentions: 0,
          avgRelevance: 0,
          uniqueEntities: new Set(),
          pageSpread: new Set(),
          contextExamples: []
        });
      }
      
      const cluster = clusters.get(otherCluster);
      cluster.topics.push(topic);
      cluster.totalMentions += topic.totalMentions || topic.frequency || 0;
      cluster.uniqueEntities = new Set([...cluster.uniqueEntities, ...(topic.relatedEntities || [])]);
      
      if (topic.pageCount) cluster.pageSpread.add(topic.pageCount);
      if (topic.contextExamples) cluster.contextExamples.push(...topic.contextExamples.slice(0, 1));
    }
  });

  // Calculate cluster metrics and convert to array
  return Array.from(clusters.values()).map(cluster => ({
    ...cluster,
    topicCount: cluster.topics.length,
    avgRelevance: Math.round(cluster.topics.reduce((sum, t) => sum + (t.crossPageRelevance || t.relevance || 0), 0) / cluster.topics.length),
    uniqueEntities: Array.from(cluster.uniqueEntities).slice(0, 10),
    pageSpread: cluster.pageSpread.size,
    contextExamples: cluster.contextExamples.slice(0, 3),
    dominanceScore: cluster.totalMentions + (cluster.topics.length * 5) + (cluster.pageSpread.size * 3)
  }))
  .sort((a, b) => b.dominanceScore - a.dominanceScore)
  .slice(0, 8); // Limit to top 8 clusters
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
    
    // Enhanced batch processing with fallback mechanisms
    const processBatch = async (urls) => {
      const promises = urls.map(async (currentUrl) => {
        if (crawledUrls.has(currentUrl)) return null;
        crawledUrls.add(currentUrl);
        
        try {
          // Primary attempt with proxy
          let response, html;
          
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(currentUrl)}`;
            response = await fetch(proxyUrl, { timeout: 10000 });
            
            if (response.ok) {
              const data = await response.json();
              html = data.contents;
            } else {
              throw new Error(`Proxy failed: ${response.status}`);
            }
          } catch (proxyError) {
            console.warn(`Proxy failed for ${currentUrl}, attempting direct fetch:`, proxyError.message);
            
            // Fallback: Direct fetch attempt
            try {
              response = await fetch(currentUrl, { 
                mode: 'cors',
                timeout: 8000,
                headers: {
                  'User-Agent': 'SemanticScope/1.0'
                }
              });
              
              if (response.ok) {
                html = await response.text();
              } else {
                throw new Error(`Direct fetch failed: ${response.status}`);
              }
            } catch (directError) {
              console.warn(`Both proxy and direct fetch failed for ${currentUrl}:`, directError.message);
              
              // Final fallback: Create minimal page data
              if (currentUrl === url) {
                // For main URL, ensure we have something to analyze
                return {
                  url: currentUrl,
                  content: {
                    title: 'Analysis Failed - Limited Data',
                    description: 'Unable to fully crawl this page, analysis based on URL structure',
                    headings: { h1: [], h2: [], h3: [] },
                    content: `Analysis of ${currentUrl}`,
                    wordCount: 10,
                    links: { internal: [], external: [] },
                    images: []
                  },
                  crawledAt: new Date().toISOString(),
                  fallback: true
                };
              }
              return null;
            }
          }

          if (!html) {
            console.warn(`No HTML content received for ${currentUrl}`);
            return null;
          }

          // Parse HTML content
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Extract comprehensive page content
          const pageContent = extractPageContent(doc, currentUrl);
          
          return {
            url: currentUrl,
            content: pageContent,
            crawledAt: new Date().toISOString(),
            doc: pages.length === 0 ? doc : null // Keep doc for first page link extraction
          };
        } catch (error) {
          console.warn(`Error processing ${currentUrl}:`, error.message);
          
          // Ensure main URL always has some data
          if (currentUrl === url && pages.length === 0) {
            return {
              url: currentUrl,
              content: {
                title: 'Analysis Failed',
                description: 'Unable to crawl this page',
                headings: { h1: [], h2: [], h3: [] },
                content: '',
                wordCount: 0,
                links: { internal: [], external: [] },
                images: []
              },
              crawledAt: new Date().toISOString(),
              error: error.message,
              fallback: true
            };
          }
          return null;
        }
      });
      
      return Promise.all(promises);
    };
    
    while (urlQueue.length > 0 && pages.length < maxPages) {
      const batchSize = Math.min(3, urlQueue.length, maxPages - pages.length);
      const batch = urlQueue.splice(0, batchSize);
      
      // Progress callback for UI updates (fixed calculation)
      if (onProgress) {
        onProgress({
          current: pages.length,
          total: Math.min(urlQueue.length + pages.length + batch.length + 5, maxPages),
          url: batch[0],
          status: 'crawling'
        });
      }
      
      const results = await processBatch(batch);
      const validResults = results.filter(Boolean);
      
      // Find additional pages to crawl (only from homepage initially)
      if (pages.length === 0 && validResults.length > 0 && validResults[0].doc && !validResults[0].fallback) {
        const linkedPages = findLinkedPages(validResults[0].doc, url, maxPages - 1);
        linkedPages.forEach(linkedUrl => {
          if (!crawledUrls.has(linkedUrl) && urlQueue.length + pages.length < maxPages) {
            urlQueue.push(linkedUrl);
          }
        });
      }

      validResults.forEach(result => {
        if (result) {
          delete result.doc; // Clean up doc reference
          pages.push(result);
        }
      });

      // Reduced delay for better performance
      if (urlQueue.length > 0 && pages.length < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Enhanced error handling - ensure we always have at least one page
    if (pages.length === 0) {
      // Create a minimal analysis based on the URL
      const fallbackPage = {
        url,
        content: {
          title: `Analysis of ${url}`,
          description: 'Limited analysis - unable to crawl content',
          headings: { h1: [], h2: [], h3: [] },
          content: `Fallback analysis for ${url}. The page could not be crawled due to CORS restrictions or network issues.`,
          wordCount: 20,
          links: { internal: [], external: [] },
          images: []
        },
        crawledAt: new Date().toISOString(),
        fallback: true,
        error: 'Crawling failed - using fallback analysis'
      };
      
      pages.push(fallbackPage);
      console.warn('Using fallback analysis due to crawling failures');
    }

    // Detect domain niche from all content
    const allContent = pages.map(p => `${p.content.title} ${p.content.headings.join(' ')} ${p.content.text}`).join(' ');
    const domainNiche = detectDomainNiche(allContent);
// Analyze each page with domain context
    pages.forEach(page => {
page.topics = analyzeTopics(page.content, page.url, domainNiche);
      
      // Extract and aggregate entities across pages
      page.entities = page.topics.reduce((allEntities, topic) => {
        if (topic.entities) {
          Object.entries(topic.entities).forEach(([category, entities]) => {
            if (!allEntities[category]) allEntities[category] = [];
            entities.forEach(entity => {
              if (!allEntities[category].includes(entity)) {
                allEntities[category].push(entity);
              }
            });
          });
        }
        return allEntities;
      }, {});
      page.entities = extractEntities(page.content.text);
      page.seoMetrics = analyzeSEO(page.content, page.url);
    });

    // Generate cross-page topic analysis and semantic clusters
    const allTopics = pages.flatMap(page => page.topics);
    const topicFrequencyMap = new Map();
    
    // Aggregate topic data across pages
    allTopics.forEach(topic => {
      const key = topic.name.toLowerCase();
      if (!topicFrequencyMap.has(key)) {
topicFrequencyMap.set(key, {
          name: topic.name,
          totalMentions: 0,
          pageCount: 0,
          relevanceScores: [],
          contextExamples: [],
          relatedEntities: new Set(),
          entities: { PERSON: new Set(), ORGANIZATION: new Set(), PRODUCT: new Set(), LOCATION: new Set(), OTHER: new Set() },
          entityFrequency: { PERSON: {}, ORGANIZATION: {}, PRODUCT: {}, LOCATION: {}, OTHER: {} }
        });
      }
      
      const aggregated = topicFrequencyMap.get(key);
      aggregated.totalMentions += topic.frequency || 0;
      aggregated.pageCount += 1;
      aggregated.relevanceScores.push(topic.relevance || 0);
      if (topic.contextExamples) aggregated.contextExamples.push(...topic.contextExamples);
if (topic.relatedEntities) topic.relatedEntities.forEach(entity => aggregated.relatedEntities.add(entity));
      
      // Aggregate categorized entities
      if (topic.entities) {
        Object.entries(topic.entities).forEach(([category, entities]) => {
          entities.forEach(entity => aggregated.entities[category].add(entity));
        });
      }
      
      // Aggregate entity frequencies
      if (topic.entityFrequency) {
        Object.entries(topic.entityFrequency).forEach(([category, frequencies]) => {
          Object.entries(frequencies).forEach(([entity, freq]) => {
            aggregated.entityFrequency[category][entity] = (aggregated.entityFrequency[category][entity] || 0) + freq;
          });
        });
      }
    });

    // Convert aggregated data to final topic list
    const consolidatedTopics = Array.from(topicFrequencyMap.values()).map(topic => ({
      ...topic,
      frequency: topic.totalMentions,
      avgFrequencyPerPage: Math.round(topic.totalMentions / topic.pageCount),
      crossPageRelevance: Math.round(topic.relevanceScores.reduce((a, b) => a + b, 0) / topic.relevanceScores.length),
      contextExamples: topic.contextExamples.slice(0, 4),
      relatedEntities: Array.from(topic.relatedEntities).slice(0, 6)
    })).sort((a, b) => b.crossPageRelevance - a.crossPageRelevance);

// Generate semantic clusters
    const semanticClusters = generateSemanticClusters(consolidatedTopics, domainNiche);

// Calculate cross-page frequency scores - fix null reference
    consolidatedTopics.forEach(topic => {
      // Ensure topic has required properties
      const pageCount = topic.pageCount || 1;
      const totalMentions = topic.totalMentions || topic.frequency || 0;
      const relevanceScores = topic.relevanceScores || [];
      
      topic.pageCount = pageCount;
      topic.avgFrequencyPerPage = pageCount > 0 ? Math.round(totalMentions / pageCount) : 0;
      topic.crossPageRelevance = relevanceScores.length > 0 
        ? Math.min(100, Math.round(relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length) + (pageCount > 1 ? pageCount * 5 : 0))
        : Math.min(100, (topic.relevance || 0) + (pageCount > 1 ? pageCount * 5 : 0));
    });

    // Merge and categorize entities
// Optimized entity processing with efficient data structures
    const entityMap = new Map();
    const pageUrlMap = new Map(); // Cache page lookups
    
    pages.forEach((page, index) => {
      pageUrlMap.set(page.url, index);
      const pageEntities = Array.isArray(page.entities) ? page.entities : 
                          Object.values(page.entities || {}).flat();
      
      pageEntities.forEach(entity => {
        const entityName = typeof entity === 'string' ? entity : entity.name;
        
        if (entityMap.has(entityName)) {
          const existing = entityMap.get(entityName);
          existing.count++;
          existing.pages.add(page.url);
        } else {
          entityMap.set(entityName, {
            name: entityName,
            count: 1,
            confidence: typeof entity === 'object' ? entity.confidence : 0.8,
            pages: new Set([page.url])
          });
        }
      });
    });
    
    // Convert Set to Array for final output
    entityMap.forEach(entity => {
      entity.pages = Array.from(entity.pages);
    });
    // Calculate overall SEO score
    const avgSeoScore = Math.round(
      pages.reduce((sum, page) => sum + page.seoMetrics.score, 0) / pages.length
    );

// Generate comprehensive URL suggestions
    const topTopics = consolidatedTopics.slice(0, 10);
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
      topics: consolidatedTopics,
      entities: Array.from(entityMap.values()).sort((a, b) => b.count - a.count),
      domainNiche,
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
await delay(100); // Optimized delay for better performance

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
    await delay(100); // Optimized delay for better performance

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