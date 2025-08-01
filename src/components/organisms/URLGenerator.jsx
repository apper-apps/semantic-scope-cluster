import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const URLGenerator = ({ suggestions }) => {
  const [customUrl, setCustomUrl] = useState("");
  const [generatedUrls, setGeneratedUrls] = useState(suggestions || []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const generateCustomUrl = () => {
    if (!customUrl.trim()) return;
    
    const formatted = formatUrl(customUrl);
    setGeneratedUrls([...generatedUrls, formatted]);
    setCustomUrl("");
    toast.success("Custom URL generated!");
  };

  const formatUrl = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getUrlDepth = (url) => {
    return (url.match(/\//g) || []).length;
  };

  const getUrlCategory = (url) => {
    const depth = getUrlDepth(url);
    if (depth === 1) return { label: "Category", color: "primary" };
    if (depth === 2) return { label: "Subcategory", color: "secondary" };
    if (depth === 3) return { label: "Content", color: "accent" };
    return { label: "Deep", color: "warning" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
<div>
        <h3 className="text-lg font-semibold text-white mb-2">URL Structure Generator</h3>
        <p className="text-slate-400">
          SEO-optimized URL suggestions based on {suggestions.length > 10 ? 'multi-page crawling and ' : ''}semantic analysis
        </p>
      </div>

      {/* URL Generator Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Generate Custom URL</h4>
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Enter topic or keywords..."
                icon="Type"
              />
            </div>
            <Button
              onClick={generateCustomUrl}
              variant="primary"
              icon="Plus"
              disabled={!customUrl.trim()}
            >
              Generate
            </Button>
          </div>
          
          {customUrl && (
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Preview:</p>
              <code className="text-primary">/{formatUrl(customUrl)}/</code>
            </div>
          )}
        </div>
      </Card>

      {/* SEO Best Practices */}
      <Card className="p-6">
        <h4 className="font-medium text-white mb-4">SEO Best Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-success/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Use lowercase letters</p>
                <p className="text-xs text-slate-400">Better for consistency and SEO</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-success/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Separate words with hyphens</p>
                <p className="text-xs text-slate-400">Improves readability and indexing</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-success/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Keep URLs shallow</p>
                <p className="text-xs text-slate-400">Maximum 3-4 levels deep</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-success/20 rounded">
                <ApperIcon name="Check" className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Include target keywords</p>
                <p className="text-xs text-slate-400">Semantic relevance is key</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Generated URLs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Suggested URL Structures</h4>
          <span className="text-sm text-slate-400">{generatedUrls.length} suggestions</span>
        </div>
        
        <div className="space-y-3">
          {generatedUrls.map((url, index) => {
            const category = getUrlCategory(url);
            const depth = getUrlDepth(url);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <code className="text-primary font-mono">/{url}/</code>
                    <span className={`text-xs px-2 py-1 rounded-full bg-${category.color}/20 text-${category.color} border border-${category.color}/30`}>
                      {category.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>Depth: {depth}</span>
                    <span>•</span>
                    <span>Length: {url.length} chars</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ApperIcon name="Zap" className="w-3 h-3" />
                      <span>SEO Optimized</span>
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Copy"
                  onClick={() => copyToClipboard(`/${url}/`)}
                  className="ml-3"
                >
                  Copy
                </Button>
              </div>
            );
          })}
          
          {generatedUrls.length === 0 && (
            <div className="text-center py-8">
              <ApperIcon name="Link" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No URL suggestions available</p>
              <p className="text-sm text-slate-500">Generate custom URLs using the form above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default URLGenerator;