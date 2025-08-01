import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AnalysisResults from "@/components/organisms/AnalysisResults";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { analysisService } from "@/services/api/analysisService";

const AnalysisPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysis && id) {
      loadAnalysis();
    }
  }, [id, analysis]);

const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await analysisService.getById(parseInt(id));
      
      // Validate analysis data structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid analysis data received');
      }
      
      // Ensure required properties exist
      const validatedResult = {
        ...result,
        topics: result.topics || [],
        pages: result.pages || [],
        seoMetrics: result.seoMetrics || { score: 0 },
        entities: result.entities || [],
        url: result.url || 'Unknown URL'
      };
      
      setAnalysis(validatedResult);
    } catch (err) {
      console.error('Analysis loading error:', err);
      setError(err.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

const handleRetry = async () => {
    if (analysis?.url) {
      try {
        setLoading(true);
        setError("");
        const result = await analysisService.analyzeUrl(analysis.url);
        
        // Validate retry result
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid analysis data received from retry');
        }
        
        const validatedResult = {
          ...result,
          topics: result.topics || [],
          pages: result.pages || [],
          seoMetrics: result.seoMetrics || { score: 0 },
          entities: result.entities || [],
          url: result.url || analysis.url
        };
        
        setAnalysis(validatedResult);
      } catch (err) {
        console.error('Analysis retry error:', err);
        setError(err.message || "Failed to retry analysis");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Loading message="Loading analysis results..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Error 
            error={error} 
            onRetry={analysis ? handleRetry : undefined}
            title="Failed to Load Analysis"
          />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Error 
            error="Analysis not found" 
            onRetry={handleGoHome}
            title="Analysis Not Found"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto py-8">
        <AnalysisResults 
          analysis={analysis} 
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};

export default AnalysisPage;