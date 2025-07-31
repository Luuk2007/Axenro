
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Allow empty values and don't convert to 0
        const value = e.target.value;
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
        
        // Only allow numeric input (including decimal point)
        if (!/^-?\d*\.?\d*$/.test(value)) {
          return; // Don't update if invalid
        }
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        inputMode={type === "number" ? "numeric" : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
