import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const TopicPill = ({ 
  topic, 
  frequency, 
  relevance, 
  onClick, 
  selected = false,
  showFrequency = true,
  className = ""
}) => {
  const getRelevanceColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "primary";
    if (score >= 40) return "warning";
    return "error";
  };

  const relevanceColor = getRelevanceColor(relevance);

  return (
    <div 
      className={`group cursor-pointer transition-all duration-200 ${
        selected ? 'scale-105' : 'hover:scale-102'
      } ${className}`}
      onClick={onClick}
    >
      <Badge
        variant={selected ? relevanceColor : "default"}
        size="md"
        className={`flex items-center space-x-2 px-4 py-2 ${
          selected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
        } group-hover:shadow-lg transition-all duration-200`}
      >
        <span className="font-medium">{topic}</span>
        
        {showFrequency && (
          <>
            <div className="w-1 h-1 bg-current rounded-full opacity-60" />
            <div className="flex items-center space-x-1">
              <ApperIcon name="Hash" className="w-3 h-3 opacity-70" />
              <span className="text-xs font-medium">{frequency}</span>
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