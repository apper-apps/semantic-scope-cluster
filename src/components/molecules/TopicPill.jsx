import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const TopicPill = ({ 
  topic, 
  frequency, 
  relevance, 
  onClick, 
  selected = false,
  showFrequency = true,
  className = "",
  entities = null,
  entityCount = null,
  isPrimaryTopic = true,
  subtopicCount = 0
}) => {
  const getRelevanceColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "primary";
    if (score >= 40) return "warning";
    return "error";
  };

  const relevanceColor = getRelevanceColor(relevance);

  // Calculate total entity count across categories
  const totalEntityCount = entityCount || (entities ? 
    Object.values(entities).reduce((total, categoryEntities) => 
      total + (Array.isArray(categoryEntities) ? categoryEntities.length : Object.keys(categoryEntities).length), 0
    ) : 0
  );

  return (
    <div 
      className={`group cursor-pointer transition-all duration-200 ${
        selected ? 'scale-105' : 'hover:scale-102'
      } ${className}`}
      onClick={onClick}
    >
      <Badge
        variant={selected ? relevanceColor : "default"}
        size={isPrimaryTopic ? "md" : "sm"}
        className={`flex items-center space-x-2 px-4 py-2 ${
          selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
        } group-hover:shadow-lg transition-all duration-200 ${
          !isPrimaryTopic ? 'border-dashed opacity-90' : ''
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isPrimaryTopic ? '' : 'text-sm'}`}>{topic}</span>
          
          {!isPrimaryTopic && subtopicCount > 0 && (
            <div className="flex items-center space-x-1">
              <ApperIcon name="GitBranch" className="w-3 h-3 opacity-50" />
              <span className="text-xs opacity-70">{subtopicCount}</span>
            </div>
          )}
        </div>
        
        {showFrequency && (
          <>
            <div className="w-1 h-1 bg-current rounded-full opacity-60" />
            <div className="flex items-center space-x-1">
              <ApperIcon name="Hash" className="w-3 h-3 opacity-70" />
              <span className="text-xs font-medium">{frequency}</span>
            </div>
          </>
        )}
        
        {/* Entity count indicator */}
        {totalEntityCount > 0 && (
          <>
            <div className="w-1 h-1 bg-current rounded-full opacity-60" />
            <div className="flex items-center space-x-1">
              <ApperIcon name="Tag" className="w-3 h-3 opacity-70" />
              <span className="text-xs font-medium">{totalEntityCount}</span>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-1">
          <ApperIcon name="TrendingUp" className="w-3 h-3 opacity-70" />
          <span className="text-xs font-medium">{relevance}%</span>
        </div>
      </Badge>
    </div>
  );
};

export default TopicPill;