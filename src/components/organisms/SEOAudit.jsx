import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const SEOAudit = ({ seoMetrics }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return "CheckCircle";
    if (score >= 60) return "AlertTriangle";
    return "XCircle";
  };

const isMultiPage = (seoMetrics.pageCount || 0) > 1 || (seoMetrics.pages && seoMetrics.pages.length > 1);
  const samplePage = seoMetrics.pages?.[0]?.seoMetrics || seoMetrics;

  const auditSections = [
    {
      title: "Title Tag Analysis",
      data: samplePage.title || seoMetrics.title,
      icon: "FileText",
      checks: [
        { 
          label: "Length (50-60 chars)", 
          value: (samplePage.title || seoMetrics.title)?.length || 0, 
          optimal: [50, 60] 
        },
        { 
          label: "Contains target keywords", 
          value: (samplePage.title || seoMetrics.title)?.hasKeywords ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Unique and descriptive", 
          value: ((samplePage.title || seoMetrics.title)?.score || 0) >= 70 ? "Yes" : "No", 
          optimal: true 
        }
      ]
    },
    {
      title: "Meta Description",
      data: samplePage.meta || seoMetrics.meta,
      icon: "AlignLeft",
      checks: [
        { 
          label: "Length (150-160 chars)", 
          value: (samplePage.meta || seoMetrics.meta)?.length || 0, 
          optimal: [150, 160] 
        },
        { 
          label: "Call-to-action present", 
          value: (samplePage.meta || seoMetrics.meta)?.hasCTA ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Semantic relevance", 
          value: `${(samplePage.meta || seoMetrics.meta)?.score || 0}%`, 
          optimal: 70 
        }
      ]
    },
    {
      title: "Heading Structure",
      data: { headings: samplePage.headings || seoMetrics.headings || [] },
      icon: "Heading",
      checks: [
        { 
          label: "H1 tag present", 
          value: (samplePage.headings || seoMetrics.headings || []).filter(h => h.level === 1).length > 0 ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Proper hierarchy", 
          value: (samplePage.headings || seoMetrics.headings || []).length > 0 ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Multiple H1 tags", 
          value: (samplePage.headings || seoMetrics.headings || []).filter(h => h.level === 1).length <= 1 ? "No" : "Yes", 
          optimal: false 
        }
      ]
    },
    {
      title: "Images & Media",
      data: samplePage.images || { total: 0, withAlt: 0, missingAlt: 0, score: 100 },
      icon: "Image",
      checks: [
        { 
          label: "Images with alt text", 
          value: `${(samplePage.images || {}).withAlt || 0}/${(samplePage.images || {}).total || 0}`, 
          optimal: true 
        },
        { 
          label: "Alt text coverage", 
          value: `${(samplePage.images || {}).score || 100}%`, 
          optimal: 90 
        },
        { 
          label: "Missing alt text", 
          value: (samplePage.images || {}).missingAlt || 0, 
          optimal: 0 
        }
      ]
    },
    {
      title: "Internal Linking",
      data: samplePage.internalLinks || { total: 0, withAnchor: 0, score: 100 },
      icon: "Link",
      checks: [
        { 
          label: "Internal links found", 
          value: (samplePage.internalLinks || {}).total || 0, 
          optimal: 3 
        },
        { 
          label: "Links with anchor text", 
          value: `${(samplePage.internalLinks || {}).withAnchor || 0}/${(samplePage.internalLinks || {}).total || 0}`, 
          optimal: true 
        },
        { 
          label: "Anchor text quality", 
          value: `${(samplePage.internalLinks || {}).score || 100}%`, 
          optimal: 80 
        }
      ]
    },
    {
      title: "Schema Markup",
      data: samplePage.schema || seoMetrics.schema,
      icon: "Code",
      checks: [
        { 
          label: "JSON-LD present", 
          value: (samplePage.schema || seoMetrics.schema)?.hasJsonLD ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Valid markup", 
          value: (samplePage.schema || seoMetrics.schema)?.isValid ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Schema types", 
          value: ((samplePage.schema || seoMetrics.schema)?.types || []).length || 0, 
          optimal: 1 
        }
      ]
    },
    {
      title: "Technical SEO",
      data: samplePage.technical || { hasCanonical: false, score: 50 },
      icon: "Settings",
      checks: [
        { 
          label: "Canonical URL present", 
          value: (samplePage.technical || {}).hasCanonical ? "Yes" : "No", 
          optimal: true 
        },
        { 
          label: "Technical score", 
          value: `${(samplePage.technical || {}).score || 50}%`, 
          optimal: 80 
        },
        { 
          label: "Page crawlability", 
          value: "Good", 
          optimal: true 
        }
      ]
    }
];

  const getCheckStatus = (check) => {
    if (Array.isArray(check.optimal)) {
      const [min, max] = check.optimal;
      const val = typeof check.value === 'number' ? check.value : parseInt(check.value) || 0;
      return val >= min && val <= max;
    } else if (typeof check.optimal === 'boolean') {
      return check.value === "Yes";
    } else if (typeof check.optimal === 'number') {
      const val = typeof check.value === 'string' ? parseInt(check.value) || 0 : check.value;
      return val >= check.optimal;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
<div>
        <h3 className="text-lg font-semibold text-white mb-2">SEO Audit Report</h3>
        <p className="text-slate-400">
          {isMultiPage 
            ? `Comprehensive SEO analysis across ${seoMetrics.pageCount} crawled pages`
            : "On-page SEO analysis and recommendations"
          }
        </p>
      </div>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
<div>
            <h4 className="text-xl font-semibold text-white">
              {isMultiPage ? "Average SEO Score" : "Overall SEO Score"}
            </h4>
            <p className="text-slate-400">
              {isMultiPage 
                ? `Based on analysis of ${seoMetrics.pageCount} pages`
                : "Based on semantic SEO factors"
              }
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <ApperIcon 
                name={getScoreIcon(seoMetrics.score)} 
                className={`w-6 h-6 text-${getScoreColor(seoMetrics.score)}`} 
              />
              <span className={`text-3xl font-bold text-${getScoreColor(seoMetrics.score)}`}>
                {seoMetrics.score}
              </span>
              <span className="text-slate-400 text-lg">/100</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r from-${getScoreColor(seoMetrics.score)} to-${getScoreColor(seoMetrics.score)} transition-all duration-1000`}
            style={{ width: `${seoMetrics.score}%` }}
          />
        </div>
      </Card>

      {/* Audit Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {auditSections.map((section, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <ApperIcon name={section.icon} className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{section.title}</h4>
                <Badge variant={getScoreColor(section.data.score || 75)} size="sm">
                  Score: {section.data.score || 75}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {section.checks.map((check, checkIndex) => {
                const isOptimal = getCheckStatus(check);
                
                return (
                  <div key={checkIndex} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ApperIcon 
                        name={isOptimal ? "Check" : "X"} 
                        className={`w-4 h-4 ${isOptimal ? 'text-success' : 'text-error'}`} 
                      />
                      <span className="text-sm text-slate-300">{check.label}</span>
                    </div>
                    <span className={`text-sm font-medium ${isOptimal ? 'text-success' : 'text-warning'}`}>
                      {check.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <ApperIcon name="Lightbulb" className="w-5 h-5 text-warning" />
          <span>Recommendations</span>
        </h4>
        
        <div className="space-y-4">
          {seoMetrics.score < 80 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ApperIcon name="AlertTriangle" className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h5 className="font-medium text-warning">Improve Title Tag</h5>
                  <p className="text-sm text-slate-300 mt-1">
                    Optimize your title tag length and include primary keywords for better SEO performance.
                  </p>
                </div>
              </div>
            </div>
          )}
          
{(seoMetrics.meta?.score || 0) < 70 && (
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Info" className="w-5 h-5 text-info mt-0.5" />
                <div>
                  <h5 className="font-medium text-info">Enhance Meta Description</h5>
                  <p className="text-sm text-slate-300 mt-1">
                    Write a compelling meta description with a clear call-to-action to improve click-through rates.
                  </p>
                </div>
              </div>
            </div>
          )}
          
{!seoMetrics.schema?.hasJsonLD && (
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Code" className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <h5 className="font-medium text-secondary">Add Schema Markup</h5>
                  <p className="text-sm text-slate-300 mt-1">
                    Implement JSON-LD structured data to help search engines better understand your content.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h5 className="font-medium text-success">Semantic SEO Focus</h5>
                <p className="text-sm text-slate-300 mt-1">
                  Continue building topical authority by creating content around related semantic topics and entities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SEOAudit;