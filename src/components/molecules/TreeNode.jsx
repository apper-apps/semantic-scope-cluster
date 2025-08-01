import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import TopicPill from "@/components/molecules/TopicPill";
import { motion, AnimatePresence } from "framer-motion";

const TreeNode = ({ 
  node, 
  level = 0, 
  onNodeClick,
  selectedNode = null 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const hasChildren = node.subtopics && node.subtopics.length > 0;
  const isSelected = selectedNode?.name === node.name;

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center space-x-2 py-2">
        {/* Expand/Collapse Button */}
        {hasChildren && (
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
        {!hasChildren && <div className="w-6" />}
        
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
        <div className="flex-1">
          <TopicPill
            topic={node.name}
            frequency={node.frequency}
            relevance={node.relevance}
            selected={isSelected}
            onClick={handleNodeClick}
            className="transition-all duration-200"
          />
        </div>
      </div>
      
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