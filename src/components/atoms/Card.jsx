import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({
  className,
  variant = "default",
  children,
  ...props
}, ref) => {
  const baseStyles = "rounded-lg transition-all duration-200";
  
  const variants = {
    default: "bg-surface border border-slate-600 shadow-lg",
    glass: "glass shadow-xl",
    gradient: "bg-gradient-to-br from-surface to-slate-700 border border-slate-500 shadow-xl",
    hover: "bg-surface border border-slate-600 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-slate-500 cursor-pointer"
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;