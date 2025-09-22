import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { Bot, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system' | 'ai-prompt';
}

interface ChatMessageProps {
  message: ChatMessage;
  currentUserId?: string;
  participants?: Array<{ id: string; username: string; avatarId?: string }>;
  className?: string;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  participants = [],
  className
}) => {
  const isFromSelf = message.from === currentUserId || message.from === 'user';
  const isSystem = message.type === 'system' || message.type === 'ai-prompt';
  
  // Get participant info
  const sender = participants.find(p => p.id === message.from);
  const senderName = sender?.username || message.from;

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAvatarGradient = (avatarId?: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-yellow-400 to-orange-400'
    ];
    const index = avatarId ? parseInt(avatarId.slice(-1)) || 0 : 0;
    return gradients[index % gradients.length];
  };

  // System/AI Prompt Messages
  if (isSystem) {
    return (
      <div className={cn('flex justify-center mb-6', className)}>
        <div className="max-w-md mx-4">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              {message.type === 'ai-prompt' ? (
                <Sparkles className="w-4 h-4 text-primary" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-medium text-primary">
                {message.type === 'ai-prompt' ? 'Conversation Starter' : 'System'}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {message.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular Messages
  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isFromSelf ? 'justify-end' : 'justify-start',
      className
    )}>
      {/* Avatar for other users */}
      {!isFromSelf && (
        <Avatar
          username={senderName}
          size="sm"
          gradient={getAvatarGradient(sender?.avatarId)}
        />
      )}

      <div className={cn(
        'max-w-xs lg:max-w-md',
        isFromSelf ? 'order-1' : 'order-2'
      )}>
        {/* Sender name and timestamp */}
        <div className={cn(
          'flex items-center gap-2 mb-1 text-xs text-muted-foreground',
          isFromSelf ? 'justify-end' : 'justify-start'
        )}>
          <span>{senderName}</span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message bubble */}
        <div className={cn(
          'rounded-xl px-4 py-3 shadow-soft transition-smooth',
          isFromSelf
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card text-card-foreground border border-border/50 rounded-bl-md'
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>

      {/* Avatar for current user */}
      {isFromSelf && (
        <Avatar
          username="You"
          size="sm"
          gradient="from-primary to-primary-light"
        />
      )}
    </div>
  );
};

// Chat Input Component
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  className
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className={cn('flex gap-2 p-4 bg-background border-t border-border', className)}>
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm',
            'placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
            'min-h-12 max-h-32 transition-smooth shadow-soft',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            height: 'auto',
            minHeight: '48px'
          }}
        />
      </div>
      <Button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        variant="hero"
        size="lg"
        className="px-6"
      >
        Send
      </Button>
    </div>
  );
};

// Typing Indicator Component
interface TypingIndicatorProps {
  username: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  username,
  className
}) => {
  return (
    <div className={cn('flex gap-3 mb-4', className)}>
      <Avatar username={username} size="sm" />
      <div className="bg-card border border-border/50 rounded-xl rounded-bl-md px-4 py-3 shadow-soft">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};