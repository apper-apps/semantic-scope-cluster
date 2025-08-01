import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Loading = ({ message = "Analyzing website content..." }) => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="skeleton h-4 w-96 rounded-lg" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="skeleton h-8 w-16 rounded" />
              <div className="skeleton h-3 w-32 rounded" />
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Ring Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full border-4 border-slate-600 flex items-center justify-center">
              <ApperIcon name="Loader2" className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="skeleton h-6 w-48 rounded" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 bg-slate-800 rounded-lg">
                  <div className="skeleton h-8 w-12 rounded mx-auto mb-2" />
                  <div className="skeleton h-3 w-16 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading Message */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/20 rounded-full">
              <ApperIcon name="Brain" className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Semantic Analysis in Progress</h3>
            <p className="text-slate-400">{message}</p>
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Extracting content...</span>
              <ApperIcon name="Check" className="w-4 h-4 text-success" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Analyzing topics...</span>
              <ApperIcon name="Loader2" className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Generating insights...</span>
              <ApperIcon name="Clock" className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Loading;