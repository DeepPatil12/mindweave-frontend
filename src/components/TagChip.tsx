import React from 'react';
import { cn } from '@/lib/utils';

interface TagChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-muted text-muted-foreground border-border/50',
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  success: 'bg-success/10 text-success border-success/20',
  muted: 'bg-background text-muted-foreground border-border shadow-soft'
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs rounded-md',
  md: 'px-3 py-1.5 text-sm rounded-lg',
  lg: 'px-4 py-2 text-base rounded-xl'
};

export const TagChip: React.FC<TagChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick
}) => {
  const Component = onClick ? 'button' : 'span';
  
  return (
    <Component
      className={cn(
        'inline-flex items-center font-medium transition-smooth border',
        variantClasses[variant],
        sizeClasses[size],
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

// Tag List Component for displaying multiple tags
interface TagListProps {
  tags: string[];
  variant?: TagChipProps['variant'];
  size?: TagChipProps['size'];
  className?: string;
  onTagClick?: (tag: string) => void;
  maxVisible?: number;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  variant = 'default',
  size = 'md',
  className,
  onTagClick,
  maxVisible
}) => {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleTags.map((tag, index) => (
        <TagChip
          key={index}
          variant={variant}
          size={size}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        >
          {tag}
        </TagChip>
      ))}
      {hiddenCount > 0 && (
        <TagChip variant="muted" size={size}>
          +{hiddenCount} more
        </TagChip>
      )}
    </div>
  );
};