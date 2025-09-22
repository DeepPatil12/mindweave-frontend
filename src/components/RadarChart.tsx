import React from 'react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface RadarData {
  curiosity: number;
  empathy: number;
  logic: number;
  novelty: number;
  reflection: number;
}

interface RadarChartProps {
  data: RadarData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64'
};

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  className,
  size = 'md'
}) => {
  // Transform data for recharts
  const chartData = [
    { dimension: 'Curiosity', value: data.curiosity * 100 },
    { dimension: 'Empathy', value: data.empathy * 100 },
    { dimension: 'Logic', value: data.logic * 100 },
    { dimension: 'Novelty', value: data.novelty * 100 },
    { dimension: 'Reflection', value: data.reflection * 100 },
  ];

  return (
    <div className={cn('w-full', sizeClasses[size], className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData}>
          <PolarGrid 
            gridType="polygon" 
            className="stroke-border/50"
          />
          <PolarAngleAxis 
            dataKey="dimension" 
            className="text-xs fill-muted-foreground font-medium"
          />
          <Radar
            name="Mindprint"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.1}
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Radar Chart with labels and descriptions
interface RadarChartCardProps extends RadarChartProps {
  title?: string;
  description?: string;
}

export const RadarChartCard: React.FC<RadarChartCardProps> = ({
  data,
  title = "Your Mindprint",
  description = "Your unique thinking patterns",
  className,
  size = 'md'
}) => {
  return (
    <div className={cn('card-soft p-6', className)}>
      {(title || description) && (
        <div className="mb-4 text-center">
          {title && <h3 className="font-semibold text-foreground">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      <RadarChart data={data} size={size} />
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize text-muted-foreground">{key}:</span>
            <span className="font-medium text-foreground">
              {Math.round(value * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};