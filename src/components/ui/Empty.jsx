import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No Analysis Yet",
  message = "Start by entering a website URL to analyze its semantic SEO structure.",
  icon = "Search",
  action,
  actionLabel = "Start Analysis"
}) => {
  const sampleUrls = [
    "https://example.com",
    "https://blog.hubspot.com",
    "https://moz.com/blog",
    "https://searchengineland.com"
  ];

  return (
    <div className="space-y-6">
      <Card className="p-12">
        <div className="text-center space-y-6">
          {/* Empty State Icon */}
          <div className="flex justify-center">
            <div className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full border border-primary/30">
              <ApperIcon name={icon} className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Empty State Message */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold gradient-text">{title}</h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Call to Action */}
          {action && (
            <div className="pt-4">
              <Button
                variant="primary"
                size="xl"
                icon="Zap"
                onClick={action}
                className="transform hover:scale-105"
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Sample URLs */}
      <Card className="p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <ApperIcon name="Lightbulb" className="w-5 h-5 text-warning" />
          <span>Try These Sample URLs</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sampleUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => action && action(url)}
              className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded group-hover:bg-primary/30 transition-colors duration-200">
                  <ApperIcon name="Globe" className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-primary transition-colors duration-200">
                    {url}
                  </p>
                  <p className="text-xs text-slate-400">Click to analyze</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="p-3 bg-primary/20 rounded-lg w-fit">
              <ApperIcon name="Brain" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Topic Analysis</h4>
              <p className="text-sm text-slate-400">
                Extract semantic topics and entities using advanced NLP techniques.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="p-3 bg-secondary/20 rounded-lg w-fit">
              <ApperIcon name="Link" className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">URL Structure</h4>
              <p className="text-sm text-slate-400">
                Generate SEO-friendly URL structures based on content hierarchy.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="p-3 bg-accent/20 rounded-lg w-fit">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">SEO Audit</h4>
              <p className="text-sm text-slate-400">
                Comprehensive on-page SEO analysis with actionable recommendations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Empty;