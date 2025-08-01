import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Input = forwardRef(({
  className,
  type = "text",
  icon,
  iconPosition = "left",
  error,
  label,
  required = false,
  ...props
}, ref) => {
  const baseStyles = "w-full bg-surface border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200";
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            icon && iconPosition === "left" && "pl-11",
            icon && iconPosition === "right" && "pr-11",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;