import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AvatarGrid } from '@/components/Avatar';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mockData } from '@/lib/api';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters')
});

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session) {
          navigate('/auth', { replace: true });
          return;
        }
        
        setUserId(session.user.id);
        
        // Check if user already has a profile
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!isMounted) return;
        
        if (profile) {
          navigate('/profile', { replace: true });
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Profile check error:', error);
        if (isMounted) setIsChecking(false);
      }
    };
    
    checkUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateUsername = () => {
    const adjectives = ['Deep', 'Cosmic', 'Quiet', 'Brilliant', 'Gentle', 'Wild', 'Ancient', 'Serene', 'Fierce', 'Mystic'];
    const nouns = ['Thinker', 'Wanderer', 'Storm', 'River', 'Mountain', 'Ocean', 'Forest', 'Star', 'Moon', 'Phoenix'];
    const num = Math.floor(Math.random() * 99) + 1;
    
    setUsername(`${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to continue."
      });
      navigate('/auth');
      return;
    }

    // Validate input
    const result = profileSchema.safeParse({ username: username.trim() });
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: result.error.errors[0].message
      });
      return;
    }

    if (!selectedAvatarId) {
      toast({
        variant: "destructive", 
        title: "Avatar required",
        description: "Please select an avatar to represent you."
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is already taken
      const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('username')
        .ilike('username', result.data.username)
        .maybeSingle();

      if (existingProfile) {
        toast({
          variant: "destructive",
          title: "Username taken",
          description: "This username is already in use. Please choose another."
        });
        setIsLoading(false);
        return;
      }

      // Create profile
      const { error } = await (supabase as any)
        .from('profiles')
        .insert([{
          id: userId,
          username: result.data.username,
          avatar_id: selectedAvatarId
        }]);

      if (error) throw error;

      toast({
        title: "Welcome to NeuroMatch!",
        description: `Your pseudonym ${result.data.username} has been created.`
      });

      navigate('/quiz', { replace: true });
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        variant: "destructive",
        title: "Profile creation failed",
        description: error.message || "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Layout showNav={false}>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Create Your Identity
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a pseudonym and avatar to get started. Your real identity stays private.
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="card-elevated p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username Section */}
              <div className="space-y-4">
                <Label htmlFor="username" className="text-lg font-semibold">
                  Choose Your Pseudonym
                </Label>
                <p className="text-sm text-muted-foreground">
                  This will be your identity on NeuroMatch. Pick something that feels like you.
                </p>
                
                <div className="flex gap-2">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a unique pseudonym..."
                    className="flex-1 shadow-soft"
                    maxLength={30}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateUsername}
                    disabled={isLoading}
                    className="px-4"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                
                {username && (
                  <p className="text-sm text-muted-foreground">
                    Preview: <span className="font-medium text-foreground">{username}</span>
                  </p>
                )}
              </div>

              {/* Avatar Section */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Select Your Avatar
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose a visual representation that speaks to you.
                </p>
                
                <AvatarGrid
                  avatars={mockData.avatars}
                  selectedId={selectedAvatarId}
                  onSelect={setSelectedAvatarId}
                  className="justify-center"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !username.trim() || !selectedAvatarId}
                >
                  {isLoading ? 'Creating Profile...' : 'Create My Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="card-soft p-4 inline-block">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>Privacy-First:</strong> Only your pseudonym and avatar are visible to others. 
              Your real identity remains completely private.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;