import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = "primary",
  description,
  className = ""
}) => {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary", 
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    info: "text-info"
  };

  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}/20 to-${color}/10 border border-${color}/20`}>
              <ApperIcon name={icon} className={`w-5 h-5 ${colorClasses[color]}`} />
            </div>
            <h3 className="text-sm font-medium text-slate-300">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{value}</p>
            {description && (
              <p className="text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-slate-400'
          }`}>
            <ApperIcon 
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
              className="w-4 h-4"
            />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;