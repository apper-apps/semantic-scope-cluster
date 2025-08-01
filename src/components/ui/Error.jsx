import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  error = "An unexpected error occurred", 
  onRetry,
  title = "Analysis Failed"
}) => {
  const getErrorIcon = (error) => {
    if (error.includes("network") || error.includes("fetch")) return "Wifi";
    if (error.includes("timeout")) return "Clock";
    if (error.includes("url") || error.includes("invalid")) return "AlertTriangle";
    return "XCircle";
  };

  const getErrorSuggestion = (error) => {
    if (error.includes("network")) return "Check your internet connection and try again.";
    if (error.includes("timeout")) return "The request took too long. Please try again.";
    if (error.includes("url")) return "Please enter a valid URL (e.g., https://example.com).";
    if (error.includes("blocked")) return "The website may be blocking our analysis. Try a different URL.";
    return "Please try again or contact support if the problem persists.";
  };

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="p-6 bg-error/20 rounded-full border border-error/30">
              <ApperIcon name={getErrorIcon(error)} className="w-12 h-12 text-error" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-lg text-error font-medium">{error}</p>
            <p className="text-slate-400 max-w-md mx-auto">
              {getErrorSuggestion(error)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {onRetry && (
              <Button
                variant="primary"
                icon="RefreshCw"
                onClick={onRetry}
                size="lg"
              >
                Try Again
              </Button>
            )}
            
            <Button
              variant="outline"
              icon="Home"
              onClick={() => window.location.href = "/"}
              size="lg"
            >
              Go Home
            </Button>
          </div>
        </div>
      </Card>

      {/* Troubleshooting Tips */}
      <Card className="p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <ApperIcon name="HelpCircle" className="w-5 h-5 text-info" />
          <span>Troubleshooting Tips</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-info/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Verify the URL</p>
                <p className="text-xs text-slate-400">Make sure the URL is correct and accessible</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-info/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Check your connection</p>
                <p className="text-xs text-slate-400">Ensure you have a stable internet connection</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-info/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Try a different website</p>
                <p className="text-xs text-slate-400">Some sites may block automated analysis</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-info/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Wait and retry</p>
                <p className="text-xs text-slate-400">Server might be temporarily busy</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Contact Support */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <ApperIcon name="MessageCircle" className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">Still having issues?</h4>
            <p className="text-slate-400 text-sm">
              Contact our support team for assistance with your analysis.
            </p>
          </div>
          <Button variant="primary" size="sm" icon="ExternalLink">
            Get Help
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Error;