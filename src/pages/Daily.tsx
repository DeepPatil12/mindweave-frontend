import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, type RadarData } from '@/lib/api';
import { Sparkles, Zap, Coffee, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

const Daily: React.FC = () => {
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has completed daily test today
    const lastDaily = localStorage.getItem('neuromatch_last_daily');
    const today = new Date().toDateString();
    
    if (lastDaily === today) {
      setHasCompletedToday(true);
    }
  }, []);

  const handleAnswerSelect = async (answer: 'novelty' | 'peace') => {
    if (isSubmitting || hasCompletedToday) return;
    
    setSelectedAnswer(answer);
    setIsSubmitting(true);

    try {
      const userStr = localStorage.getItem('neuromatch_user');
      if (!userStr) {
        toast({
          variant: "destructive",
          title: "Please complete your profile first",
          description: "Sign up to take daily tests."
        });
        return;
      }

      const user = JSON.parse(userStr);
      const result = await api.submitDailyTest(user.id, answer);
      
      // Mark as completed today
      localStorage.setItem('neuromatch_last_daily', new Date().toDateString());
      setHasCompletedToday(true);
      
      toast({
        title: "Daily insight recorded!",
        description: "Your mindprint has been subtly updated."
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to record response",
        description: "Please try again."
      });
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = [
    {
      id: 'today-energy',
      question: "Right now, what calls to you more?",
      options: [
        {
          id: 'novelty',
          label: 'Something New',
          description: 'Explore, discover, break routine',
          icon: Sparkles,
          color: 'from-primary to-primary-light'
        },
        {
          id: 'peace',
          label: 'Something Peaceful',
          description: 'Reflect, restore, find calm',
          icon: Mountain,
          color: 'from-secondary to-secondary-light'
        }
      ]
    }
  ];

  const currentQuestion = questions[0]; // For MVP, just one question

  if (hasCompletedToday) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="card-elevated p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Daily Insight Complete
              </h1>
              
              <p className="text-muted-foreground mb-6">
                You've already shared your daily micro-insight! Your mindprint 
                evolves subtly with each response, helping us find better matches.
              </p>
              
              <div className="text-sm text-muted-foreground">
                Come back tomorrow for another quick reflection.
              </div>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Daily Micro-Test
          </h1>
          
          <p className="text-muted-foreground text-lg">
            A quick reflection to keep your mindprint fresh and your matches relevant
          </p>
        </motion.div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-elevated p-8">
            <h2 className="text-xl font-semibold text-foreground text-center mb-8">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.options.map((option, index) => {
                const Icon = option.icon;
                const isSelected = selectedAnswer === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(option.id as 'novelty' | 'peace')}
                    disabled={isSubmitting}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all duration-300 group
                      ${isSelected 
                        ? 'border-primary shadow-glow' 
                        : 'border-border hover:border-primary/50 hover:shadow-medium'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Background Gradient */}
                    <div className={`
                      absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300
                      ${isSelected ? 'opacity-20' : ''}
                      bg-gradient-to-br ${option.color}
                    `} />
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300
                        bg-gradient-to-br ${option.color}
                        ${isSelected ? 'scale-110 shadow-large' : 'group-hover:scale-105'}
                      `}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {option.label}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    
                    {/* Loading State */}
                    {isSubmitting && isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="card-soft p-6 text-center">
            <h3 className="font-semibold text-foreground mb-2">
              How Daily Tests Work
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These quick daily reflections help us understand how your preferences 
              shift over time. Your answers subtly adjust your mindprint, ensuring 
              your matches stay aligned with who you are right now.
            </p>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Daily;