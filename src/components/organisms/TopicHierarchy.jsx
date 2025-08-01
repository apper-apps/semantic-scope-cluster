import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import TreeNode from "@/components/molecules/TreeNode";
import ApperIcon from "@/components/ApperIcon";

const TopicHierarchy = ({ topics }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("tree");

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

const buildHierarchy = (topics) => {
    const hierarchy = [];
    const mainTopics = topics.filter(topic => topic.relevance >= 70);
    
    mainTopics.forEach(mainTopic => {
      const subtopics = topics.filter(topic => 
        topic.relevance < 70 && 
        topic.name.toLowerCase().includes(mainTopic.name.toLowerCase().split(' ')[0])
      );
      
      hierarchy.push({
        ...mainTopic,
        subtopics: subtopics,
        pageCount: mainTopic.pages ? mainTopic.pages.length : 1
      });
    });
    
    return hierarchy;
  };

  const hierarchy = buildHierarchy(topics);
  const hasMultiplePages = topics.some(topic => topic.pages && topic.pages.length > 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
<div>
          <h3 className="text-lg font-semibold text-white">Topic Hierarchy</h3>
          <p className="text-slate-400">
            Semantic topic clusters and relationships{hasMultiplePages && " across all crawled pages"}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
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
<div>
                          <h4 className="font-medium text-white">{topic.name}</h4>
                          <p className="text-sm text-slate-400">
                            Frequency: {topic.frequency} mentions
                            {topic.pageCount && topic.pageCount > 1 && (
                              <span className="ml-2">• {topic.pageCount} pages</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">{topic.relevance}%</div>
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
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Hash" className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{selectedNode.frequency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="TrendingUp" className="w-4 h-4 text-primary" />
                      <span className="text-primary">{selectedNode.relevance}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Related Entities</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.relatedEntities?.slice(0, 6).map((entity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        {entity}
                      </span>
                    )) || (
                      <span className="text-sm text-slate-400">No related entities found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Relevance Score</h5>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedNode.relevance}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedNode.relevance >= 80 ? "Highly relevant" :
                     selectedNode.relevance >= 60 ? "Moderately relevant" :
                     selectedNode.relevance >= 40 ? "Somewhat relevant" : "Low relevance"}
                  </p>
                </div>

                {selectedNode.subtopics && selectedNode.subtopics.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Subtopics</h5>
                    <div className="space-y-1">
                      {selectedNode.subtopics.map((subtopic, index) => (
                        <div key={index} className="text-sm text-slate-400 flex items-center justify-between">
                          <span>{subtopic.name}</span>
                          <span className="text-xs">{subtopic.relevance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="MousePointer" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Click on a topic to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TopicHierarchy;