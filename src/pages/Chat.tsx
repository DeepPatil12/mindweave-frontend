import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { ChatMessageComponent, ChatInput, TypingIndicator } from '@/components/ChatMessage';
import { useToast } from '@/hooks/use-toast';
import { api, type ChatMessage, type Match } from '@/lib/api';
import { ArrowLeft, MoreVertical, Flag, VolumeX, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Chat: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatPartner, setChatPartner] = useState<Match | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (chatId) {
      loadChat();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    if (!chatId) return;
    
    try {
      const userStr = localStorage.getItem('neuromatch_user');
      if (!userStr) {
        navigate('/signup');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Load messages
      const chatMessages = await api.getChatMessages(chatId);
      setMessages(chatMessages);
      
      // For MVP, get match info from matches list
      const matches = await api.getMatches(user.id);
      const matchId = chatId.replace('chat_', '');
      const partner = matches.find(m => m.id === matchId);
      setChatPartner(partner || null);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load chat",
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatId || isSending) return;

    const userStr = localStorage.getItem('neuromatch_user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    
    setIsSending(true);
    
    // Optimistically add message to UI
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      from: user.id,
      text: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInputValue('');
    
    // Show typing indicator briefly
    setShowTyping(true);
    
    try {
      await api.sendMessage(chatId, user.id, inputValue.trim());
      
      // Simulate partner response after delay (for MVP)
      setTimeout(() => {
        setShowTyping(false);
        // In real implementation, this would come from WebSocket/polling
      }, 2000);
      
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again."
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEndConversation = () => {
    toast({
      title: "Conversation archived",
      description: "You can always find new matches from your profile."
    });
    navigate('/matches');
  };

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

  if (isLoading) {
    return (
      <Layout showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse-soft text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <div className="flex flex-col h-screen">
        {/* Chat Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            {chatPartner && (
              <div className="flex items-center gap-3">
                <Avatar
                  username={chatPartner.username}
                  size="sm"
                  gradient={getAvatarGradient(chatPartner.avatarId)}
                />
                <div>
                  <h2 className="font-semibold text-foreground">
                    {chatPartner.username}
                  </h2>
                  <div className="text-xs text-muted-foreground">
                    {chatPartner.score}% resonance
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleEndConversation}>
              <X className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </motion.header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {messages.map((message, index) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                currentUserId="user"
                participants={[
                  { id: 'user', username: 'You' },
                  { 
                    id: chatPartner?.id || 'partner', 
                    username: chatPartner?.username || 'Partner',
                    avatarId: chatPartner?.avatarId
                  }
                ]}
              />
            ))}
            
            {showTyping && chatPartner && (
              <TypingIndicator username={chatPartner.username} />
            )}
            
            <div ref={messagesEndRef} />
          </motion.div>
        </div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isSending}
            placeholder={`Message ${chatPartner?.username || 'your match'}...`}
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Chat;