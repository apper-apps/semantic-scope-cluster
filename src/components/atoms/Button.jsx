import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({
  className,
  variant = "primary",
  size = "md",
  children,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] focus:ring-primary",
    secondary: "bg-surface border border-slate-600 text-white hover:border-slate-500 hover:bg-slate-700 focus:ring-slate-500",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-slate-300 hover:text-white hover:bg-surface focus:ring-slate-500",
    success: "bg-gradient-to-r from-success to-accent text-white hover:shadow-lg hover:shadow-success/25 hover:scale-[1.02] focus:ring-success",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:shadow-lg hover:shadow-error/25 hover:scale-[1.02] focus:ring-error"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
    xl: "px-8 py-4 text-lg h-14"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!loading && icon && iconPosition === "left" && (
        <ApperIcon name={icon} className="w-4 h-4 mr-2" />
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon name={icon} className="w-4 h-4 ml-2" />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;