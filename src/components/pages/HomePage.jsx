import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/molecules/SearchBar";
import AnalysisResults from "@/components/organisms/AnalysisResults";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { analysisService } from "@/services/api/analysisService";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const HomePage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError("");
    setAnalysis(null);

try {
      const result = await analysisService.analyzeUrl(url);
      setAnalysis(result);
      
      toast.success("Analysis completed successfully!");
    } catch (err) {
      setError(err.message || "Failed to analyze website");
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (analysis?.url) {
      handleAnalyze(analysis.url);
    }
  };

  const handleEmptyAction = (url) => {
    if (url) {
      handleAnalyze(url);
    } else {
      // Scroll to search bar or focus it
      document.querySelector('input[type="text"]')?.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Loading message="Extracting semantic content and analyzing SEO structure..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Error error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <AnalysisResults analysis={analysis} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-primary/30">
                  <ApperIcon name="Brain" className="w-16 h-16 text-primary" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-black gradient-text">
                  SemanticScope
                </h1>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Unlock the power of semantic SEO with advanced NLP analysis, 
                  topic clustering, and intelligent URL structure generation.
                </p>
              </div>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SearchBar
                  onAnalyze={handleAnalyze}
                  loading={loading}
                  placeholder="Enter website URL to analyze (e.g., https://example.com)"
                />
              </motion.div>
            </div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
            >
              <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  <div className="p-4 bg-primary/20 rounded-xl w-fit mx-auto">
                    <ApperIcon name="Search" className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Topic Discovery</h3>
                    <p className="text-sm text-slate-400">
                      Extract main topics, subtopics, and semantic entities using advanced NLP
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/20 rounded-xl w-fit mx-auto">
                    <ApperIcon name="Link" className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">URL Optimization</h3>
                    <p className="text-sm text-slate-400">
                      Generate SEO-friendly URL structures based on semantic hierarchy
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  <div className="p-4 bg-accent/20 rounded-xl w-fit mx-auto">
                    <ApperIcon name="TrendingUp" className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">SEO Insights</h3>
                    <p className="text-sm text-slate-400">
                      Comprehensive on-page analysis with actionable recommendations
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Empty State */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <Empty
          title="Ready to Analyze?"
          message="Enter a website URL above to discover its semantic SEO potential and get actionable insights."
          icon="Zap"
          action={handleEmptyAction}
          actionLabel="Get Started"
        />
      </div>
    </div>
  );
};

export default HomePage;