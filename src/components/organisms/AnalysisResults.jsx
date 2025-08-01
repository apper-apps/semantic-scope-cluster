import { useState, useMemo } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import MetricCard from "@/components/molecules/MetricCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import TopicHierarchy from "@/components/organisms/TopicHierarchy";
import URLGenerator from "@/components/organisms/URLGenerator";
import SEOAudit from "@/components/organisms/SEOAudit";
import ExportModal from "@/components/organisms/ExportModal";
import ApperIcon from "@/components/ApperIcon";
import { motion } from "framer-motion";
const AnalysisResults = ({ analysis, onRetry }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportModal, setShowExportModal] = useState(false);

  // Memoized calculations for better performance - must be called before any early returns
  const metrics = useMemo(() => {
    if (!analysis) return [];
    return [
      {
        title: "Pages Crawled",
        value: analysis.pages?.length || 1,
        icon: "Globe",
        color: "primary",
        description: "Total pages analyzed"
      },
      {
        title: "Total Topics",
        value: analysis.topics?.length || 0,
        icon: "Hash",
        color: "secondary",
        description: "Semantic topics across all pages"
      },
      {
        title: "Named Entities",
        value: Array.isArray(analysis.entities) ? analysis.entities.length : 
               Object.values(analysis.entities || {}).reduce((total, category) => 
                 total + (Array.isArray(category) ? category.length : 0), 0),
        icon: "Tag", 
        color: "accent",
        description: "Entities found across pages"
      },
      {
        title: "Average SEO Score",
        value: `${analysis.seoMetrics?.score || 0}/100`,
        icon: "TrendingUp",
        color: (analysis.seoMetrics?.score || 0) >= 80 ? "success" : (analysis.seoMetrics?.score || 0) >= 60 ? "warning" : "error",
        description: "Overall SEO health"
      }
    ];
  }, [analysis?.pages?.length, analysis?.topics?.length, analysis?.entities, analysis?.seoMetrics?.score]);

  // Page type breakdown for multi-page analysis
  const pageTypeBreakdown = useMemo(() => 
    analysis?.crawlSummary?.pageTypes || analysis?.seoMetrics?.pageTypes || {}, 
    [analysis?.crawlSummary?.pageTypes, analysis?.seoMetrics?.pageTypes]
  );

  // Memoized top topics for performance
  const topTopics = useMemo(() => analysis?.topics?.slice(0, 6) || [], [analysis?.topics]);

  // Early return after all hooks have been called
  if (!analysis) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: "BarChart3" },
    { id: "topics", label: "Topic Analysis", icon: "Brain" },
    { id: "clusters", label: "Semantic Clusters", icon: "Network" },
    { id: "urls", label: "URL Structure", icon: "Link" },
    { id: "seo", label: "SEO Audit", icon: "Search" }
  ];

  const hasMultiplePages = (analysis.pages?.length || 0) > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          <p className="text-slate-400">
            Analyzed: <span className="text-primary">{analysis.url}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={onRetry}
            size="sm"
          >
            Retry Analysis
          </Button>
          <Button
            variant="primary"
            icon="Download"
            onClick={() => setShowExportModal(true)}
            size="sm"
          >
            Export Results
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>

{/* SEO Score Ring */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          <div className="flex-shrink-0">
            <ProgressRing
              progress={analysis?.seoMetrics?.score || 0}
              size={160}
              color={(analysis?.seoMetrics?.score || 0) >= 80 ? "#22C55E" : (analysis?.seoMetrics?.score || 0) >= 60 ? "#F59E0B" : "#EF4444"}
              label={hasMultiplePages ? "Average SEO" : "SEO Health"}
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {hasMultiplePages ? "Multi-Page SEO Analysis" : "SEO Performance Summary"}
</h3>
              <p className="text-slate-400">
                {hasMultiplePages 
                  ? `Analyzed ${analysis?.pages?.length || 0} pages with an average SEO score of ${analysis?.seoMetrics?.score || 0}/100`
                  : `Your website scores ${analysis?.seoMetrics?.score || 0} out of 100 based on semantic SEO factors`
                }
              </p>
            </div>
            
            {hasMultiplePages ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Page Types Discovered</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(pageTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="text-center p-3 bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-primary">{count}</div>
                      <div className="text-xs text-slate-400 capitalize">{type} {count === 1 ? 'page' : 'pages'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {analysis.seoMetrics.title?.score || analysis.pages?.[0]?.seoMetrics?.title?.score || 0}%
                  </div>
                  <div className="text-sm text-slate-400">Title Quality</div>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {analysis.seoMetrics.meta?.score || analysis.pages?.[0]?.seoMetrics?.meta?.score || 0}%
                  </div>
                  <div className="text-sm text-slate-400">Meta Tags</div>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.seoMetrics.headings?.length || analysis.pages?.[0]?.seoMetrics?.headings?.length || 0}
                  </div>
                  <div className="text-sm text-slate-400">Headings</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-600">
          <nav className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500"
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
                    <h4 className="font-medium text-slate-300 mb-3">Top Topics</h4>
                    <div className="space-y-2">
                      {(analysis?.topics || []).slice(0, 5).map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                          <span className="text-white">{topic?.name || 'Unknown Topic'}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-400">Relevance: {topic?.relevance || topic?.crossPageRelevance || 0}%</span>
                            <div className="w-12 bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${topic?.relevance || topic?.crossPageRelevance || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
<div>
                    <h4 className="font-medium text-slate-300 mb-4">
                      Enhanced Topic Analysis {hasMultiplePages && <span className="text-xs text-slate-500">(Cross-page frequency tracking)</span>}
                    </h4>
                    <div className="space-y-4">
                      {analysis.domainNiche && (
                        <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <ApperIcon name="Target" className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Detected Domain Niche</span>
                          </div>
                          <p className="text-white font-semibold">{analysis.domainNiche.primary}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Topics are ranked by relevance to this domain for better insights
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3">
                        {topTopics.map((topic, index) => (
                          <motion.div 
                            key={`${topic.name}-${index}`} 
                            className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-white">{topic.name}</h5>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                                  <span>{topic.totalMentions || topic.frequency} mentions</span>
                                  {topic.pageCount > 1 && (
                                    <span>• {topic.pageCount} pages • Avg: {Math.round(topic.avgFrequencyPerPage || topic.frequency)}/page</span>
                                  )}
                                  <span>• {topic.crossPageRelevance || topic.relevance}% relevance</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-16 bg-slate-700 rounded-full h-2 ml-4">
                                <div 
                                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${topic.crossPageRelevance || topic.relevance}%` }}
                                />
                              </div>
                            </div>
                            
                            {topic.contextExamples && topic.contextExamples.length > 0 && (
                              <div className="space-y-2">
                                <h6 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Context Examples</h6>
                                {topic.contextExamples.slice(0, 2).map((context, contextIndex) => (
                                  <div key={contextIndex} className="p-2 bg-slate-900 rounded text-xs text-slate-300 italic border-l-2 border-primary/30">
                                    "{context}"
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {topic.relatedEntities && topic.relatedEntities.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {topic.relatedEntities.slice(0, 5).map((entity, entityIndex) => (
                                    <span key={entityIndex} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                      {entity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

{activeTab === "topics" && (
            <TopicHierarchy topics={analysis.topics} />
          )}

          {activeTab === "clusters" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Semantic Topic Clusters</h3>
                  <p className="text-slate-400">Topics grouped by semantic similarity for strategic content planning</p>
                </div>
                {analysis.domainNiche && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                    <ApperIcon name="Target" className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-medium">{analysis.domainNiche.primary}</span>
                  </div>
                )}
              </div>

              {analysis.semanticClusters && analysis.semanticClusters.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.semanticClusters.map((cluster, index) => (
                    <motion.div
                      key={cluster.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">{cluster.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{cluster.topicCount} topics</span>
                            <span>•</span>
                            <span>{cluster.totalMentions} mentions</span>
                            {cluster.pageSpread > 1 && (
                              <>
                                <span>•</span>
                                <span>{cluster.pageSpread} pages</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">{cluster.avgRelevance}%</div>
                            <div className="text-xs text-slate-500">Relevance</div>
                          </div>
                          <div className="w-12 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${cluster.avgRelevance}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Top Topics in Cluster */}
                        <div>
                          <h5 className="text-sm font-medium text-slate-300 mb-2">Key Topics</h5>
                          <div className="space-y-2">
                            {cluster.topics.slice(0, 3).map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                                <span className="text-white text-sm">{topic.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-slate-400">{topic.frequency} mentions</span>
                                  <div className="w-8 bg-slate-700 rounded-full h-1">
                                    <div 
                                      className="bg-primary h-1 rounded-full"
                                      style={{ width: `${(topic.frequency / cluster.totalMentions) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Context Examples */}
                        {cluster.contextExamples && cluster.contextExamples.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-300 mb-2">Context Examples</h5>
                            <div className="space-y-2">
                              {cluster.contextExamples.slice(0, 2).map((context, contextIndex) => (
                                <div key={contextIndex} className="p-2 bg-slate-900 rounded text-xs text-slate-300 italic border-l-2 border-primary/30">
                                  "{context}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Entities */}
                        {cluster.uniqueEntities && cluster.uniqueEntities.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-300 mb-2">Related Entities</h5>
                            <div className="flex flex-wrap gap-1">
                              {cluster.uniqueEntities.slice(0, 6).map((entity, entityIndex) => (
                                <span key={entityIndex} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                  {entity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Content Planning Insights */}
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <ApperIcon name="Lightbulb" className="w-4 h-4 text-warning" />
                            <h5 className="text-sm font-medium text-warning">Content Planning Insight</h5>
                          </div>
                          <p className="text-xs text-slate-400">
                            {cluster.dominanceScore > 80 
                              ? `High-opportunity cluster - consider creating pillar content around ${cluster.name.toLowerCase()} topics`
                              : cluster.dominanceScore > 50
                              ? `Moderate presence - could expand content in ${cluster.name.toLowerCase()} area`
                              : `Emerging theme - monitor ${cluster.name.toLowerCase()} topics for growth potential`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <ApperIcon name="Network" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No semantic clusters available for this analysis</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "urls" && (
            <URLGenerator suggestions={analysis.urlSuggestions} />
          )}

          {activeTab === "seo" && (
            <SEOAudit seoMetrics={analysis.seoMetrics} />
          )}
        </div>
      </Card>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          analysis={analysis}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </motion.div>
  );
};

export default AnalysisResults;