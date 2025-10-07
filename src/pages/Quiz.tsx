import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { QuizQuestionComponent, QuizProgress } from '@/components/QuizQuestion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api, type QuizQuestion, type QuizAnswer } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, SkipForward, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and load quiz questions
  useEffect(() => {
    const checkAuthAndLoadQuestions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please sign up first to take the quiz."
          });
          navigate('/signup');
          return;
        }

        const quizQuestions = await api.getQuizQuestions();
        setQuestions(quizQuestions);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load quiz",
          description: "Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadQuestions();
  }, [toast, navigate]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const canGoNext = currentAnswer !== undefined;
  const canGoPrev = currentIndex > 0;

  const handleAnswerChange = (answer: QuizAnswer) => {
    const newAnswers = new Map(answers);
    newAnswers.set(answer.questionId, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowConfirmDialog(true);
    } else {
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      setShowConfirmDialog(true);
    } else {
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No user found. Please sign up first.');
      }
      
      // Convert answers map to array
      const answersArray = Array.from(answers.values());
      
      // Submit quiz
      await api.submitQuiz(session.user.id, answersArray);
      
      toast({
        title: "Quiz completed!",
        description: "Your mindprint is being analyzed..."
      });

      // Navigate to processing page
      navigate('/processing');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="animate-pulse-soft">
            <h1 className="text-2xl font-semibold text-foreground mb-4">
              Preparing Your Mindprint Quiz...
            </h1>
            <p className="text-muted-foreground">This will just take a moment</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Quiz Unavailable
          </h1>
          <p className="text-muted-foreground mb-6">
            Unable to load the mindprint quiz. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mindprint Quiz
            </h1>
            <p className="text-muted-foreground">
              Help us understand your unique thinking patterns
            </p>
          </div>
          
          <QuizProgress 
            current={currentIndex + 1} 
            total={questions.length}
            className="mb-2"
          />
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <QuizQuestionComponent
              question={currentQuestion}
              answer={currentAnswer}
              onChange={handleAnswerChange}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>

            <Button
              variant={isLastQuestion ? "hero" : "default"}
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastQuestion ? (
                <>
                  <Check className="w-4 h-4" />
                  Complete Quiz
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Your Mindprint?</DialogTitle>
              <DialogDescription>
                You've answered {answers.size} out of {questions.length} questions. 
                Our AI will analyze your responses to create your unique mindprint and find your matches.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Review Answers
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Submit Quiz'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Take your time. There are no right or wrong answers — we want to understand how you think.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Quiz;