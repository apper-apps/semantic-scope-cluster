import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import TreeNode from "@/components/molecules/TreeNode";
import ApperIcon from "@/components/ApperIcon";

const TopicHierarchy = ({ topics }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("tree");
  const [showEntities, setShowEntities] = useState(true);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  // Get entity category icons and colors
  const getEntityIcon = (category) => {
    switch (category) {
      case 'PERSON': return 'User';
      case 'ORGANIZATION': return 'Building';
      case 'PRODUCT': return 'Package';
      case 'LOCATION': return 'MapPin';
      default: return 'Tag';
    }
  };

  const getEntityColor = (category) => {
    switch (category) {
      case 'PERSON': return 'text-blue-400';
      case 'ORGANIZATION': return 'text-green-400';
      case 'PRODUCT': return 'text-purple-400';
      case 'LOCATION': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

const buildHierarchy = (topics) => {
    if (!Array.isArray(topics) || topics.length === 0) return [];
    
    const hierarchy = [];
    const mainTopics = topics.filter(topic => (topic.crossPageRelevance || topic.relevance || 0) >= 70);
    
    mainTopics.forEach(mainTopic => {
      const subtopics = topics.filter(topic => 
        (topic.crossPageRelevance || topic.relevance || 0) < 70 && 
        topic.name && mainTopic.name &&
        topic.name.toLowerCase().includes(mainTopic.name.toLowerCase().split(' ')[0])
      );
      
      hierarchy.push({
        ...mainTopic,
        subtopics: subtopics || [],
        pageCount: mainTopic.pages ? mainTopic.pages.length : 1,
        totalMentions: mainTopic.totalMentions || mainTopic.frequency || 0,
        avgFrequencyPerPage: mainTopic.avgFrequencyPerPage || mainTopic.frequency || 0,
        contextExamples: mainTopic.contextExamples || [],
        entities: mainTopic.entities || { PERSON: [], ORGANIZATION: [], PRODUCT: [], LOCATION: [], OTHER: [] },
        entityFrequency: mainTopic.entityFrequency || {},
        relatedEntities: mainTopic.relatedEntities || []
      });
    });
    
    return hierarchy;
  };

  const hierarchy = buildHierarchy(topics);
  const hasMultiplePages = topics.some(topic => topic.pages && topic.pages.length > 1);
  
// Calculate total entities across all topics
  const totalEntityStats = (topics || []).reduce((stats, topic) => {
    if (topic.entities && typeof topic.entities === 'object') {
      Object.entries(topic.entities).forEach(([category, entities]) => {
        if (Array.isArray(entities)) {
          if (!stats[category]) stats[category] = new Set();
          entities.forEach(entity => stats[category].add(entity));
        }
      });
    }
    return stats;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-white">Enhanced Topic & Entity Analysis</h3>
          <p className="text-slate-400">
            NLP-powered topic hierarchy with named entity detection{hasMultiplePages && " across all crawled pages"}
          </p>
          {Object.keys(totalEntityStats).length > 0 && (
            <div className="flex items-center space-x-4 mt-2 text-sm">
              {Object.entries(totalEntityStats).map(([category, entities]) => 
                entities.size > 0 && (
                  <div key={category} className="flex items-center space-x-1">
                    <ApperIcon name={getEntityIcon(category)} className={`w-3 h-3 ${getEntityColor(category)}`} />
                    <span className="text-slate-300">{entities.size}</span>
                    <span className="text-slate-500 capitalize text-xs">{category.toLowerCase()}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showEntities ? "primary" : "secondary"}
            size="sm"
            icon="Tag"
            onClick={() => setShowEntities(!showEntities)}
          >
            {showEntities ? "Hide" : "Show"} Entities
          </Button>
          <Button
            variant={viewMode === "tree" ? "primary" : "secondary"}
            size="sm"
            icon="GitBranch"
            onClick={() => setViewMode("tree")}
          >
            Tree View
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "secondary"}
            size="sm"
            icon="List"
            onClick={() => setViewMode("list")}
          >
            List View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Tree/List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-2">
              {viewMode === "tree" ? (
                hierarchy.map((topic, index) => (
                  <TreeNode
                    key={`${topic.name}-${index}`}
                    node={topic}
                    onNodeClick={handleNodeClick}
                    selectedNode={selectedNode}
                    showEntities={showEntities}
                  />
                ))
              ) : (
                <div className="space-y-3">
                  {topics.map((topic, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedNode?.name === topic.name
                          ? "border-primary bg-primary/10"
                          : "border-slate-600 hover:border-slate-500 bg-slate-800"
                      }`}
                      onClick={() => handleNodeClick(topic)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{topic.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{topic.totalMentions || topic.frequency} mentions</span>
                            {topic.pageCount > 1 && (
                              <span>• {topic.pageCount} pages • Avg: {Math.round(topic.avgFrequencyPerPage || topic.frequency)}/page</span>
                            )}
                            {topic.entities && Object.values(topic.entities).some(entities => entities.length > 0) && (
                              <span>• {Object.values(topic.entities).reduce((total, entities) => total + entities.length, 0)} entities</span>
                            )}
                          </div>
                          
                          {/* Entity Preview */}
                          {showEntities && topic.entities && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(topic.entities).map(([category, entities]) =>
                                entities.slice(0, 3).map((entity, entityIndex) => (
                                  <span
                                    key={`${category}-${entityIndex}`}
                                    className={`px-1.5 py-0.5 bg-slate-700 rounded text-xs flex items-center space-x-1 ${getEntityColor(category)}`}
                                  >
                                    <ApperIcon name={getEntityIcon(category)} className="w-2.5 h-2.5" />
                                    <span>{entity}</span>
                                  </span>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">{topic.crossPageRelevance || topic.relevance}%</div>
                          <div className="text-xs text-slate-400">Relevance</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Topic Details */}
        <div>
          <Card className="p-6 sticky top-24">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">{selectedNode.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Hash" className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{selectedNode.totalMentions || selectedNode.frequency}</span>
                      <span className="text-xs text-slate-500">mentions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="TrendingUp" className="w-4 h-4 text-primary" />
                      <span className="text-primary">{selectedNode.crossPageRelevance || selectedNode.relevance}%</span>
                    </div>
                    {selectedNode.pageCount > 1 && (
                      <>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Globe" className="w-4 h-4 text-secondary" />
                          <span className="text-slate-300">{selectedNode.pageCount}</span>
                          <span className="text-xs text-slate-500">pages</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="BarChart3" className="w-4 h-4 text-accent" />
                          <span className="text-slate-300">{Math.round(selectedNode.avgFrequencyPerPage || selectedNode.frequency)}</span>
                          <span className="text-xs text-slate-500">avg/page</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Named Entities by Category */}
                {selectedNode.entities && Object.values(selectedNode.entities).some(entities => entities.length > 0) && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-3">Named Entities (NLP Detected)</h5>
                    <div className="space-y-3">
                      {Object.entries(selectedNode.entities).map(([category, entities]) =>
                        entities.length > 0 && (
                          <div key={category}>
                            <div className="flex items-center space-x-2 mb-2">
                              <ApperIcon name={getEntityIcon(category)} className={`w-4 h-4 ${getEntityColor(category)}`} />
                              <span className="text-xs font-medium text-slate-400 capitalize">
                                {category.toLowerCase()} ({entities.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-6">
                              {entities.map((entity, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
                                >
                                  <span>{entity}</span>
                                  {selectedNode.entityFrequency?.[category]?.[entity] && (
                                    <span className="text-slate-500">
                                      ({selectedNode.entityFrequency[category][entity]})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedNode.contextExamples && selectedNode.contextExamples.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Context Examples</h5>
                    <div className="space-y-2">
                      {selectedNode.contextExamples.slice(0, 2).map((context, index) => (
                        <div key={index} className="p-2 bg-slate-800 rounded text-xs text-slate-400 italic border-l-2 border-primary/30">
                          "{context}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Traditional Keywords</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.relatedEntities?.slice(0, 6).map((entity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        {entity}
                      </span>
                    )) || (
                      <span className="text-sm text-slate-400">No related keywords found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Domain Relevance Score</h5>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedNode.crossPageRelevance || selectedNode.relevance}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedNode.crossPageRelevance || selectedNode.relevance) >= 80 ? "Highly relevant to domain niche" :
                     (selectedNode.crossPageRelevance || selectedNode.relevance) >= 60 ? "Moderately relevant to domain" :
                     (selectedNode.crossPageRelevance || selectedNode.relevance) >= 40 ? "Somewhat relevant to domain" : "Low domain relevance"}
                    {selectedNode.pageCount > 1 && " (cross-page NLP analysis)"}
                  </p>
                </div>

                {selectedNode.pages && selectedNode.pages.length > 1 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Found on Pages</h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedNode.pages.slice(0, 5).map((pageUrl, index) => (
                        <div key={index} className="text-xs text-slate-400 truncate">
                          {pageUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </div>
                      ))}
                      {selectedNode.pages.length > 5 && (
                        <div className="text-xs text-slate-500">+{selectedNode.pages.length - 5} more pages</div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNode.subtopics && selectedNode.subtopics.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Semantic Subtopics</h5>
                    <div className="space-y-2">
                      {selectedNode.subtopics.map((subtopic, index) => (
                        <div key={index} className="p-2 bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white">{subtopic.name}</span>
                            <span className="text-xs text-primary">{subtopic.crossPageRelevance || subtopic.relevance}%</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {subtopic.frequency} mentions
                            {subtopic.relatedEntities && subtopic.relatedEntities.length > 0 && (
                              <span className="ml-2">• Related: {subtopic.relatedEntities.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="MousePointer" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Click on a topic to view enhanced NLP analysis</p>
                {hasMultiplePages && (
                  <p className="text-xs text-slate-500 mt-2">Multi-page entity detection with frequency tracking</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TopicHierarchy;