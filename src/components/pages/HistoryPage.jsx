import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { analysisService } from "@/services/api/analysisService";
import { format } from "date-fns";
import { motion } from "framer-motion";

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await analysisService.getAll();
      setAnalyses(data);
    } catch (err) {
      setError(err.message || "Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    
    try {
      await analysisService.delete(id);
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    } catch (err) {
      console.error("Failed to delete analysis:", err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning"; 
    return "error";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Loading message="Loading analysis history..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Error error={error} onRetry={loadHistory} />
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Empty
            title="No Analysis History"
            message="You haven't analyzed any websites yet. Start your first semantic SEO analysis now!"
            icon="History"
            action={() => window.location.href = "/"}
            actionLabel="Start Analysis"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Analysis History</h1>
            <p className="text-slate-400">
              View and manage your previous semantic SEO analyses
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-400">
              {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
            </span>
            <Button
              variant="primary"
              icon="Plus"
              onClick={() => window.location.href = "/"}
            >
              New Analysis
            </Button>
          </div>
        </motion.div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate mb-1">
                        {new URL(analysis.url).hostname}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">
                        {analysis.url}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={getScoreColor(analysis.seoMetrics.score)}
                      size="sm"
                    >
                      {analysis.seoMetrics.score}%
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {analysis.topics.length}
                      </div>
                      <div className="text-xs text-slate-400">Topics</div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-secondary">
                        {analysis.entities.length}
                      </div>
                      <div className="text-xs text-slate-400">Entities</div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-accent">
                        {analysis.urlSuggestions.length}
                      </div>
                      <div className="text-xs text-slate-400">URLs</div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <ApperIcon name="Clock" className="w-4 h-4" />
                    <span>
                      {format(new Date(analysis.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-600">
                    <Link
                      to={`/analysis/${analysis.id}`}
                      state={{ analysis }}
                      className="flex-1"
                    >
                      <Button
                        variant="primary" 
                        size="sm"
                        icon="Eye"
                        className="w-full"
                      >
                        View Results
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon="Download"
                      className="px-3"
                      onClick={() => {
                        // This would trigger export functionality
                        console.log("Export analysis:", analysis.id);
                      }}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon="Trash2"
                      className="px-3 hover:bg-error/10 hover:border-error hover:text-error"
                      onClick={() => handleDelete(analysis.id)}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination or Load More */}
        {analyses.length >= 10 && (
          <div className="text-center pt-8">
            <Button
              variant="outline"
              icon="MoreHorizontal"
              onClick={() => {
                // This would load more analyses
                console.log("Load more analyses");
              }}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;