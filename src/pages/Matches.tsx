import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MatchGrid } from '@/components/MatchCard';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, type Match } from '@/lib/api';
import { RefreshCw, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    
    try {
      // Check if user exists and has completed quiz
      const userStr = localStorage.getItem('neuromatch_user');
      if (!userStr) {
        navigate('/signup');
        return;
      }

      const user = JSON.parse(userStr);
      if (!user.radar || !user.tags) {
        navigate('/profile');
        toast({
          title: "Complete your mindprint first",
          description: "Take the quiz to find your matches."
        });
        return;
      }

      const userMatches = await api.getMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load matches",
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadMatches(true);
  };

  const handleMessage = async (matchId: string) => {
    try {
      const userStr = localStorage.getItem('neuromatch_user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const { chatId } = await api.createChat([user.id, matchId]);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to start chat",
        description: "Please try again."
      });
    }
  };

  const handleViewProfile = (matchId: string) => {
    // For MVP, this could show a modal with more details
    toast({
      title: "Coming soon",
      description: "Detailed profiles will be available soon!"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-16">
          <div className="animate-pulse-soft text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Finding Your Matches...
            </h1>
            <p className="text-muted-foreground">
              Analyzing neural connections
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-soft p-6 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-4 bg-muted rounded w-24 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Your NeuroMatches
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            People whose minds resonate with yours
          </p>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Find New Matches'}
          </Button>
        </motion.div>

        {/* Stats Card */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-soft p-6 text-center">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {matches.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Neural Matches
                  </div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. Resonance
                  </div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-success">
                    {matches.filter(m => m.score >= 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    High Matches
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Matches Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {matches.length > 0 ? (
            <MatchGrid
              matches={matches}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
          ) : (
            /* No Matches State */
            <Card className="card-soft p-12 text-center">
              <div className="w-24 h-24 gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Building Your Network
              </h2>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Our AI is still analyzing neural patterns to find minds that truly 
                resonate with yours. Check back soon for your first matches!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Matches
                </Button>
                
                <Button variant="outline" onClick={() => navigate('/daily')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Take Daily Micro-Test
                </Button>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="card-soft p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-foreground mb-2">
              How Matching Works
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our AI compares your mindprint across multiple cognitive dimensions: 
              curiosity, empathy, logic, novelty-seeking, and reflection depth. 
              Higher resonance scores indicate more compatible thinking patterns.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Matches;