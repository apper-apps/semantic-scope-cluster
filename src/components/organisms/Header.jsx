import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { motion } from "framer-motion";

const Header = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMobileMenuToggle(!isMenuOpen);
  };

  const navigationItems = [
    { path: "/", label: "Analyze", icon: "Search" },
    { path: "/history", label: "History", icon: "History" }
  ];

  return (
    <header className="bg-surface border-b border-slate-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-200">
              <ApperIcon name="Brain" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SemanticScope</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Semantic SEO Analyzer</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? "text-primary bg-primary/10 border border-primary/20" 
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <ApperIcon name={item.icon} className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon="Download"
              className="hidden sm:flex"
            >
              Export
            </Button>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
            >
              <ApperIcon name={isMenuOpen ? "X" : "Menu"} className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-slate-600 bg-surface"
        >
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "text-primary bg-primary/10 border border-primary/20" 
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-slate-600">
              <Button
                variant="outline"
                size="sm"
                icon="Download"
                className="w-full justify-center"
              >
                Export Results
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;