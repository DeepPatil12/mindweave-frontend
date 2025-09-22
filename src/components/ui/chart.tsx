import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Simplified chart container for NeuroMatch
// Only includes the functionality we actually need for the radar chart

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config?: ChartConfig;
    children: React.ComponentProps<typeof ResponsiveContainer>["children"];
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex aspect-square justify-center text-xs [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
});

ChartContainer.displayName = "ChartContainer";

// Re-export ResponsiveContainer for direct use if needed
export { ResponsiveContainer };
export { ChartContainer };