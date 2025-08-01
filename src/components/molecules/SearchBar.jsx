import { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const SearchBar = ({ 
  placeholder = "Enter URL to analyze...", 
  onAnalyze, 
  loading = false,
  className = ""
}) => {
  const [url, setUrl] = useState("");
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
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL or domain");
      return;
    }

    setError("");
    let formattedUrl = url.trim();
    
    // Add protocol if missing
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAnalyze(formattedUrl);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <Input
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError("");
        }}
        placeholder={placeholder}
        icon="Globe"
        error={error}
        className="text-lg py-4"
      />
      
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        icon="Search"
        className="w-full"
      >
        {loading ? "Analyzing..." : "Analyze Website"}
      </Button>
    </form>
  );
};

export default SearchBar;