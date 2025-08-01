import { useState } from "react";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  placeholder = "Enter URL to analyze...", 
  onAnalyze, 
  loading = false,
  className = ""
}) => {
const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState("url"); // 'url' or 'content'
  const [error, setError] = useState("");
  const validateUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch {
      // Check if it's a domain without protocol
      if (input.includes('.') && !input.includes(' ')) {
        return true;
      }
      return false;
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError(inputMode === "url" ? "Please enter a URL" : "Please enter content to analyze");
      return;
    }

if (inputMode === "url" && !validateUrl(input)) {
      setError("Please enter a valid URL or domain");
      return;
    }

setError("");
    let processedInput = input.trim();
    
    if (inputMode === "url") {
      // Add protocol if missing
      if (!processedInput.startsWith('http://') && !processedInput.startsWith('https://')) {
        processedInput = 'https://' + processedInput;
      }
    }

    onAnalyze(processedInput, inputMode);
  };

return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Input Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-surface border border-slate-600 rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => {
              setInputMode("url");
              setInput("");
              setError("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
              inputMode === "url"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ApperIcon name="Globe" size={16} />
            <span>Website URL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode("content");
              setInput("");
              setError("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
              inputMode === "content"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ApperIcon name="FileText" size={16} />
            <span>Text Content</span>
          </button>
        </div>
      </div>

      {/* Input Field */}
      {inputMode === "url" ? (
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter website URL (e.g., https://example.com)"
          icon="Globe"
          error={error}
          className="text-lg py-4"
        />
      ) : (
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          placeholder="Paste or type content to analyze for entities (articles, product descriptions, etc.)"
          error={error}
          className="text-lg min-h-32"
          rows={4}
        />
      )}
      
<Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        icon={inputMode === "url" ? "Globe" : "Brain"}
        className="w-full"
      >
        {loading 
          ? (inputMode === "url" ? "Crawling & Analyzing..." : "Analyzing...") 
          : inputMode === "url" 
            ? "Crawl & Analyze Website" 
            : "Extract Entities"
        }
      </Button>
      
      {loading && inputMode === "url" && (
        <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Crawling website pages...</span>
          </div>
          <p className="text-xs text-slate-400">
            Discovering and analyzing up to 25 pages for comprehensive SEO audit
          </p>
        </div>
      )}
    </form>
  );
};

export default SearchBar;