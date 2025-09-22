import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  id?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl'
};

export const Avatar: React.FC<AvatarProps> = ({
  id,
  username = 'User',
  size = 'md',
  gradient = 'from-primary to-primary-light',
  className,
  onClick,
  selected = false
}) => {
  const initials = username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white cursor-pointer transition-all duration-200',
        `bg-gradient-to-br ${gradient}`,
        sizeClasses[size],
        selected && 'ring-4 ring-primary ring-offset-2 ring-offset-background',
        onClick && 'hover:scale-105 hover:shadow-glow',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {initials}
    </div>
  );
};

// Avatar Grid Component for selection
interface AvatarGridProps {
  avatars: Array<{ id: string; name: string; color: string }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const AvatarGrid: React.FC<AvatarGridProps> = ({
  avatars,
  selectedId,
  onSelect,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {avatars.map((avatar) => (
        <div key={avatar.id} className="flex flex-col items-center gap-2">
          <Avatar
            id={avatar.id}
            username={avatar.name}
            size="lg"
            gradient={avatar.color}
            selected={selectedId === avatar.id}
            onClick={() => onSelect(avatar.id)}
          />
          <span className="text-xs text-muted-foreground text-center">
            {avatar.name}
          </span>
        </div>
      ))}
    </div>
  );
};