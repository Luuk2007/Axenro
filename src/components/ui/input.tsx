
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Allow empty values and don't convert to 0
        let value = e.target.value;
        if (value === "") {
          // For controlled components, we need to pass the empty string
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: {
                ...e.target,
                value: ""
              }
            };
            onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
          }
          return;
        }
        
        // Replace comma with period for decimal input (European format support)
        value = value.replace(',', '.');
        
        // Only allow numeric input (including decimal point)
        if (!/^-?\d*\.?\d*$/.test(value)) {
          return; // Don't update if invalid
        }
        
        // Update the event with the normalized value
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: value
            }
          };
          onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
        return;
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        inputMode={type === "number" ? "decimal" : undefined}
        step={type === "number" ? "any" : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
