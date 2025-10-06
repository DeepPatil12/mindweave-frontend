import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { TagList } from '@/components/TagChip';
import { RadarChartCard } from '@/components/RadarChart';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, type User } from '@/lib/api';
import { Edit, RefreshCw, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem('neuromatch_user');
        if (!userStr) {
          if (isMounted) navigate('/signup', { replace: true });
          return;
        }

        const localUser = JSON.parse(userStr);
        
        // Try to get updated profile from API
        const profile = await api.getProfile(localUser.id);
        if (!isMounted) return;
        
        if (profile) {
          setUser(profile);
        } else {
          setUser(localUser);
        }
      } catch (error) {
        console.error('Profile load error:', error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Failed to load profile",
            description: "Please try again."
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

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
      <Layout>
        <div className="max-w-4xl mx-auto py-16">
          <div className="animate-pulse-soft text-center">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            Please complete your signup process first.
          </p>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const hasCompletedQuiz = user.radar && user.tags;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Avatar
            username={user.username}
            size="xl"
            gradient={getAvatarGradient(user.avatarId)}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {user.username}
          </h1>
          <p className="text-muted-foreground">
            {hasCompletedQuiz 
              ? 'Your unique mindprint is ready' 
              : 'Complete your mindprint to find matches'
            }
          </p>
        </motion.div>

        {hasCompletedQuiz ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mindprint Tags */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Mindprint Tags
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  These reflect your unique thinking patterns
                </p>
                <TagList 
                  tags={user.tags || []} 
                  variant="primary"
                  className="justify-center"
                />
              </Card>
            </motion.div>

            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RadarChartCard
                data={user.radar!}
                title="Cognitive Dimensions"
                description="Your mental fingerprint across key areas"
              />
            </motion.div>
          </div>
        ) : (
          /* Incomplete Profile */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-soft p-8 text-center">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Complete Your Mindprint
              </h2>
              <p className="text-muted-foreground mb-6">
                Take our thoughtful quiz to discover your unique thinking patterns 
                and find people who resonate with your mind.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/quiz">Start Mindprint Quiz</Link>
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* View Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-elevated p-6 text-center group hover:shadow-large transition-all duration-300">
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Your NeuroMatches
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasCompletedQuiz 
                  ? 'Connect with minds that think like yours'
                  : 'Complete your mindprint to see matches'
                }
              </p>
              <Button 
                variant={hasCompletedQuiz ? "hero" : "soft"}
                size="sm"
                asChild
                disabled={!hasCompletedQuiz}
              >
                <Link to="/matches">
                  {hasCompletedQuiz ? 'View Matches' : 'Complete Quiz First'}
                </Link>
              </Button>
            </Card>
          </motion.div>

          {/* Retake Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-elevated p-6 text-center group hover:shadow-large transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-muted-foreground to-muted-foreground/80 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Refine Your Mindprint
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                People change — update your responses to keep your matches fresh
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/quiz">Retake Quiz</Link>
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="card-soft p-4 inline-block">
            <p className="text-sm text-muted-foreground">
              🔒 Your real identity stays private. Only your pseudonym and mindprint are visible to matches.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;