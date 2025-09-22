import React from 'react';
import { Avatar } from './Avatar';
import { TagList } from './TagChip';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Match {
  id: string;
  username: string;
  avatarId: string;
  score: number;
  tags: string[];
  snippet: string;
  lastActive?: string;
}

interface MatchCardProps {
  match: Match;
  className?: string;
  onMessage?: (matchId: string) => void;
  onViewProfile?: (matchId: string) => void;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  className,
  onMessage,
  onViewProfile,
  compact = false
}) => {
  const getAvatarGradient = (avatarId: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-yellow-400 to-orange-400'
    ];
    const index = parseInt(avatarId.slice(-1)) || 0;
    return gradients[index % gradients.length];
  };

  if (compact) {
    return (
      <div className={cn('card-soft p-4 transition-smooth hover:shadow-medium', className)}>
        <div className="flex items-center gap-3">
          <Avatar
            username={match.username}
            size="md"
            gradient={getAvatarGradient(match.avatarId)}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{match.username}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-primary">{match.score}%</span>
              <div className="flex-1 max-w-20">
                <Progress value={match.score} className="h-1" />
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMessage?.(match.id)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card-elevated p-6 transition-smooth hover:shadow-large group', className)}>
      {/* Header with avatar and match score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar
            username={match.username}
            size="lg"
            gradient={getAvatarGradient(match.avatarId)}
          />
          <div>
            <h3 className="font-semibold text-foreground text-lg">{match.username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Resonance:</span>
              <span className="font-semibold text-primary text-lg">{match.score}%</span>
            </div>
          </div>
        </div>
        
        {/* Resonance Progress Ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${match.score * 2.827} 282.7`}
              className="transition-all duration-700 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{match.score}%</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <TagList 
          tags={match.tags} 
          variant="primary" 
          size="sm" 
          maxVisible={3}
        />
      </div>

      {/* Snippet */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">They said:</p>
        <blockquote className="text-foreground italic border-l-2 border-primary/30 pl-3">
          "{match.snippet}"
        </blockquote>
      </div>

      {/* Last Active */}
      {match.lastActive && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">
            Active {match.lastActive}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="hero"
          size="sm"
          className="flex-1"
          onClick={() => onMessage?.(match.id)}
        >
          <MessageCircle className="w-4 h-4" />
          Say Hi
        </Button>
        <Button
          variant="ghost-primary"
          size="sm"
          onClick={() => onViewProfile?.(match.id)}
        >
          <User className="w-4 h-4" />
          Profile
        </Button>
      </div>
    </div>
  );
};

// Match Grid Component
interface MatchGridProps {
  matches: Match[];
  className?: string;
  onMessage?: (matchId: string) => void;
  onViewProfile?: (matchId: string) => void;
  compact?: boolean;
}

export const MatchGrid: React.FC<MatchGridProps> = ({
  matches,
  className,
  onMessage,
  onViewProfile,
  compact = false
}) => {
  if (matches.length === 0) {
    return (
      <div className={cn('card-soft p-8 text-center', className)}>
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="font-semibold text-foreground mb-2">No matches yet</h3>
        <p className="text-muted-foreground">
          Complete your mindprint quiz to find your neural matches!
        </p>
      </div>
    );
  }

  const gridClass = compact 
    ? 'space-y-3' 
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className={cn(gridClass, className)}>
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onMessage={onMessage}
          onViewProfile={onViewProfile}
          compact={compact}
        />
      ))}
    </div>
  );
};