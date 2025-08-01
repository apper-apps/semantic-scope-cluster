import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import TopicPill from "@/components/molecules/TopicPill";
import { motion, AnimatePresence } from "framer-motion";

const TreeNode = ({ 
  node, 
  level = 0, 
  onNodeClick,
  selectedNode = null,
  showEntities = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [showEntityDetails, setShowEntityDetails] = useState(false);
  
  const hasChildren = node.subtopics && node.subtopics.length > 0;
  const hasEntities = node.entities && Object.values(node.entities).some(entities => entities.length > 0);
  const isSelected = selectedNode?.name === node.name;

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const toggleEntityDetails = (e) => {
    e.stopPropagation();
    setShowEntityDetails(!showEntityDetails);
  };

  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Get entity category icons
  const getEntityIcon = (category) => {
    switch (category) {
      case 'PERSON': return 'User';
      case 'ORGANIZATION': return 'Building';
      case 'PRODUCT': return 'Package';
      case 'LOCATION': return 'MapPin';
      default: return 'Tag';
    }
  };

  // Get entity category colors
  const getEntityColor = (category) => {
    switch (category) {
      case 'PERSON': return 'text-blue-400';
      case 'ORGANIZATION': return 'text-green-400';
      case 'PRODUCT': return 'text-purple-400';
      case 'LOCATION': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center space-x-2 py-2">
        {/* Expand/Collapse Button */}
        {(hasChildren || (hasEntities && showEntities)) && (
          <button
            onClick={toggleExpand}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 transition-colors duration-200"
          >
            <ApperIcon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              className="w-4 h-4 text-slate-400" 
            />
          </button>
        )}
        
        {/* Spacer for nodes without children */}
        {!hasChildren && (!hasEntities || !showEntities) && <div className="w-6" />}
        
        {/* Indentation */}
        {level > 0 && (
          <div className="flex items-center">
            {Array.from({ length: level }).map((_, i) => (
              <div key={i} className="w-6 flex justify-center">
                <div className="w-px h-6 bg-slate-600" />
              </div>
            ))}
          </div>
        )}
        
        {/* Node Content */}
        <div className="flex-1 flex items-center space-x-2">
          <TopicPill
            topic={node.name}
            frequency={node.totalMentions || node.frequency}
            relevance={node.crossPageRelevance || node.relevance}
            selected={isSelected}
            onClick={handleNodeClick}
            entities={node.entities}
            isPrimaryTopic={level === 0}
            subtopicCount={node.subtopics?.length || 0}
            className="transition-all duration-200"
          />
          
          {/* Entity Toggle Button */}
          {hasEntities && showEntities && (
            <button
              onClick={toggleEntityDetails}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-700 transition-colors duration-200"
              title="Show entities"
            >
              <ApperIcon 
                name="Tag" 
                className={`w-3 h-3 ${showEntityDetails ? 'text-primary' : 'text-slate-500'}`} 
              />
            </button>
          )}
        </div>
      </div>
      
      {/* Entity Details */}
      <AnimatePresence initial={false}>
        {showEntityDetails && hasEntities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden ml-8"
          >
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-2">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(node.entities).map(([category, entities]) => 
                  entities.length > 0 && (
                    <div key={category} className="flex items-center space-x-2">
                      <ApperIcon 
                        name={getEntityIcon(category)} 
                        className={`w-3 h-3 ${getEntityColor(category)}`} 
                      />
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {category.toLowerCase()}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {entities.slice(0, 3).map((entity, index) => (
                          <span 
                            key={index}
                            className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                          >
                            {entity}
                            {node.entityFrequency?.[category]?.[entity] && (
                              <span className="ml-1 opacity-60">
                                ({node.entityFrequency[category][entity]})
                              </span>
                            )}
                          </span>
                        ))}
                        {entities.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{entities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 border-l border-slate-600 pl-2">
              {node.subtopics.map((subtopic, index) => (
                <TreeNode
                  key={`${subtopic.name}-${index}`}
                  node={subtopic}
                  level={level + 1}
                  onNodeClick={onNodeClick}
                  selectedNode={selectedNode}
                  showEntities={showEntities}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeNode;