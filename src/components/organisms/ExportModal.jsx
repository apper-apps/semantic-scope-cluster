import { useState } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ExportModal = ({ analysis, onClose }) => {
  const [exportFormat, setExportFormat] = useState("json");
  const [exportSections, setExportSections] = useState({
    topics: true,
    entities: true,
    seoMetrics: true,
    urlSuggestions: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: "json", label: "JSON", icon: "FileJson", description: "Structured data format" },
    { id: "csv", label: "CSV", icon: "FileSpreadsheet", description: "Spreadsheet format" },
    { id: "txt", label: "Text", icon: "FileText", description: "Plain text report" }
  ];

  const sectionOptions = [
    { id: "topics", label: "Topic Analysis", icon: "Brain" },
    { id: "entities", label: "Named Entities", icon: "Tag" },
    { id: "seoMetrics", label: "SEO Metrics", icon: "Search" },
    { id: "urlSuggestions", label: "URL Suggestions", icon: "Link" }
  ];

  const generateExportData = () => {
    const exportData = {};
    
    if (exportSections.topics) {
      exportData.topics = analysis.topics;
    }
    if (exportSections.entities) {
      exportData.entities = analysis.entities;
    }
    if (exportSections.seoMetrics) {
      exportData.seoMetrics = analysis.seoMetrics;
    }
    if (exportSections.urlSuggestions) {
      exportData.urlSuggestions = analysis.urlSuggestions;
    }
    
    exportData.metadata = {
      url: analysis.url,
      timestamp: analysis.timestamp,
      exportedAt: new Date().toISOString()
    };
    
    return exportData;
  };

  const convertToCSV = (data) => {
    let csv = "";
    
    if (data.topics) {
      csv += "Topics\n";
      csv += "Name,Frequency,Relevance\n";
      data.topics.forEach(topic => {
        csv += `"${topic.name}",${topic.frequency},${topic.relevance}\n`;
      });
      csv += "\n";
    }
    
    if (data.entities) {
      csv += "Entities\n";
      data.entities.forEach(entity => {
        csv += `"${entity}"\n`;
      });
      csv += "\n";
    }
    
    if (data.urlSuggestions) {
      csv += "URL Suggestions\n";
      data.urlSuggestions.forEach(url => {
        csv += `"${url}"\n`;
      });
    }
    
    return csv;
  };

  const convertToText = (data) => {
    let text = `SEO Analysis Report\n`;
    text += `URL: ${data.metadata.url}\n`;
    text += `Generated: ${new Date(data.metadata.exportedAt).toLocaleString()}\n`;
    text += `${"=".repeat(50)}\n\n`;
    
    if (data.topics) {
      text += `TOPICS (${data.topics.length})\n`;
      text += `${"─".repeat(20)}\n`;
      data.topics.forEach(topic => {
        text += `• ${topic.name} (${topic.frequency} mentions, ${topic.relevance}% relevance)\n`;
      });
      text += "\n";
    }
    
    if (data.entities) {
      text += `ENTITIES (${data.entities.length})\n`;
      text += `${"─".repeat(20)}\n`;
      data.entities.forEach(entity => {
        text += `• ${entity}\n`;
      });
      text += "\n";
    }
    
    if (data.seoMetrics) {
      text += `SEO METRICS\n`;
      text += `${"─".repeat(20)}\n`;
      text += `Overall Score: ${data.seoMetrics.score}/100\n`;
      text += `Title Score: ${data.seoMetrics.title.score}%\n`;
      text += `Meta Score: ${data.seoMetrics.meta.score}%\n`;
      text += `Headings: ${data.seoMetrics.headings.length}\n\n`;
    }
    
    if (data.urlSuggestions) {
      text += `URL SUGGESTIONS (${data.urlSuggestions.length})\n`;
      text += `${"─".repeat(20)}\n`;
      data.urlSuggestions.forEach(url => {
        text += `• /${url}/\n`;
      });
    }
    
    return text;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const data = generateExportData();
      let content, filename, mimeType;
      
      switch (exportFormat) {
        case "json":
          content = JSON.stringify(data, null, 2);
          filename = `seo-analysis-${Date.now()}.json`;
          mimeType = "application/json";
          break;
        case "csv":
          content = convertToCSV(data);
          filename = `seo-analysis-${Date.now()}.csv`;
          mimeType = "text/csv";
          break;
        case "txt":
          content = convertToText(data);
          filename = `seo-analysis-${Date.now()}.txt`;
          mimeType = "text/plain";
          break;
        default:
          throw new Error("Invalid export format");
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Analysis exported as ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error("Failed to export analysis");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExportSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ApperIcon name="Download" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Export Analysis</h3>
                  <p className="text-sm text-slate-400">Choose format and sections</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={onClose}
              />
            </div>

            {/* Export Format */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-white">Export Format</h4>
              <div className="space-y-2">
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      exportFormat === format.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-600 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name={format.icon} className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm opacity-70">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Sections */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-white">Include Sections</h4>
              <div className="space-y-2">
                {sectionOptions.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      exportSections[section.id]
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-slate-600 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ApperIcon name={section.icon} className="w-4 h-4" />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      <ApperIcon 
                        name={exportSections[section.id] ? "Check" : "Plus"} 
                        className="w-4 h-4" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                loading={isExporting}
                icon="Download"
                className="flex-1"
                disabled={!Object.values(exportSections).some(Boolean)}
              >
                Export
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;