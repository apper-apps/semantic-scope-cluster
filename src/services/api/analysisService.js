import mockAnalyses from "@/services/mockData/analyses.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock NLP analysis function
const performSemanticAnalysis = (url) => {
  // Simulate topic extraction based on URL
  const domain = new URL(url).hostname;
  const path = new URL(url).pathname;
  
  // Generate mock topics based on URL content
  const topics = [
    {
      name: "Digital Marketing",
      frequency: Math.floor(Math.random() * 50) + 20,
      relevance: Math.floor(Math.random() * 30) + 70,
      subtopics: [
        {
          name: "SEO Strategy",
          frequency: Math.floor(Math.random() * 20) + 10,
          relevance: Math.floor(Math.random() * 20) + 60,
          relatedEntities: ["Google", "Keywords", "Backlinks"]
        },
        {
          name: "Content Marketing",
          frequency: Math.floor(Math.random() * 15) + 8,
          relevance: Math.floor(Math.random() * 25) + 55,
          relatedEntities: ["Blog Posts", "Social Media", "Video Content"]
        }
      ],
      relatedEntities: ["Analytics", "Conversion Rate", "Lead Generation"]
    },
    {
      name: "Web Development",
      frequency: Math.floor(Math.random() * 40) + 15,
      relevance: Math.floor(Math.random() * 25) + 65,
      subtopics: [
        {
          name: "Frontend Technologies",
          frequency: Math.floor(Math.random() * 18) + 12,
          relevance: Math.floor(Math.random() * 20) + 70,
          relatedEntities: ["React", "JavaScript", "CSS"]
        }
      ],
      relatedEntities: ["HTML", "Responsive Design", "User Experience"]
    },
    {
      name: "Business Strategy",
      frequency: Math.floor(Math.random() * 35) + 10,
      relevance: Math.floor(Math.random() * 30) + 60,
      subtopics: [
        {
          name: "Market Analysis",
          frequency: Math.floor(Math.random() * 12) + 6,
          relevance: Math.floor(Math.random() * 15) + 50,
          relatedEntities: ["Competitors", "Market Share", "Growth"]
        }
      ],
      relatedEntities: ["ROI", "KPIs", "Revenue Growth"]
    }
  ];

  const entities = [
    "Google", "Facebook", "LinkedIn", "Instagram", "YouTube",
    "Analytics", "SEO", "Content Marketing", "Social Media",
    "JavaScript", "React", "HTML", "CSS", "API", "Database"
  ];

  const seoScore = Math.floor(Math.random() * 40) + 60;
  
  const seoMetrics = {
    score: seoScore,
    title: {
      score: Math.floor(Math.random() * 30) + 70,
      length: Math.floor(Math.random() * 20) + 45,
      hasKeywords: Math.random() > 0.3
    },
    meta: {
      score: Math.floor(Math.random() * 35) + 65,
      length: Math.floor(Math.random() * 30) + 140,
      hasCTA: Math.random() > 0.4
    },
    headings: [
      { level: 1, text: "Main Heading", score: Math.floor(Math.random() * 20) + 80 },
      { level: 2, text: "Section Heading", score: Math.floor(Math.random() * 25) + 75 },
      { level: 2, text: "Another Section", score: Math.floor(Math.random() * 20) + 70 },
      { level: 3, text: "Subsection", score: Math.floor(Math.random() * 15) + 65 }
    ],
    schema: {
      hasJsonLD: Math.random() > 0.4,
      isValid: Math.random() > 0.2,
      types: Math.random() > 0.5 ? ["Article", "WebPage"] : []
    }
  };

  // Generate URL suggestions based on topics
  const urlSuggestions = topics.map(topic => 
    topic.name.toLowerCase().replace(/\s+/g, '-')
  ).concat(
    topics.flatMap(topic => 
      topic.subtopics.map(sub => 
        `${topic.name.toLowerCase().replace(/\s+/g, '-')}/${sub.name.toLowerCase().replace(/\s+/g, '-')}`
      )
    )
  );

  return {
    topics,
    entities: entities.slice(0, Math.floor(Math.random() * 8) + 8),
    seoMetrics,
    urlSuggestions: urlSuggestions.slice(0, Math.floor(Math.random() * 5) + 5)
  };
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
    await delay(2500); // Simulate analysis time

    try {
      // Validate URL
      new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Simulate potential failures
    if (Math.random() < 0.05) {
      throw new Error("Network timeout - please try again");
    }

    if (Math.random() < 0.03) {
      throw new Error("Unable to access website - check if the URL is correct");
    }

    // Perform mock semantic analysis
    const analysisResults = performSemanticAnalysis(url);
    
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