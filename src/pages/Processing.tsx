import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingLayout } from '@/components/Layout';
import { Progress } from '@/components/ui/progress';
import { Brain, Sparkles, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const processingSteps = [
  { icon: Brain, label: 'Analyzing cognitive patterns', duration: 2000 },
  { icon: Sparkles, label: 'Mapping neural pathways', duration: 1500 },
  { icon: Heart, label: 'Identifying emotional resonance', duration: 1800 },
  { icon: Users, label: 'Finding your matches', duration: 1200 }
];

const Processing: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let timeouts: NodeJS.Timeout[] = [];

    const runProcessing = async () => {
      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        if (!isMounted) return;
        
        setCurrentStep(i);
        
        const stepDuration = processingSteps[i].duration;
        const stepStartTime = Date.now();
        
        // Animate progress for this step
        const stepProgressTimer = setInterval(() => {
          if (!isMounted) {
            clearInterval(stepProgressTimer);
            return;
          }
          
          const elapsed = Date.now() - stepStartTime;
          const stepProgress = Math.min(elapsed / stepDuration, 1);
          const overallProgress = ((i + stepProgress) / processingSteps.length) * 100;
          
          setProgress(overallProgress);
          
          if (stepProgress >= 1) {
            clearInterval(stepProgressTimer);
          }
        }, 50);

        // Wait for step to complete
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            clearInterval(stepProgressTimer);
            resolve(void 0);
          }, stepDuration);
          timeouts.push(timeout);
        });
      }

      if (!isMounted) return;

      // Complete processing
      setProgress(100);
      
      // Navigate to profile after a brief pause
      const finalTimeout = setTimeout(() => {
        if (isMounted) navigate('/profile', { replace: true });
      }, 800);
      timeouts.push(finalTimeout);
    };

    runProcessing();

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const CurrentIcon = processingSteps[currentStep]?.icon || Brain;

  return (
    <LoadingLayout
      title="Analyzing your mental fingerprint..."
      description="Our AI is creating your unique mindprint"
    >
      {/* Animated Processing Visualization */}
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 mx-auto relative"
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          
          {/* Progress Ring */}
          <svg className="w-32 h-32 transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${progress * 2.827} 282.7`}
              className="transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center"
            >
              <CurrentIcon className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Progress Details */}
      <div className="space-y-4 mb-8">
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-foreground">
            {processingSteps[currentStep]?.label || 'Processing...'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round(progress)}% complete
          </p>
        </motion.div>
      </div>

      {/* Processing Steps List */}
      <div className="space-y-3 max-w-sm mx-auto">
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.5 }}
              animate={{ 
                opacity: isActive ? 1 : isCompleted ? 0.8 : 0.5,
                scale: isActive ? 1.05 : 1
              }}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? 'bg-success text-success-foreground' : 
                  isActive ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              
              <span className={`
                text-sm font-medium transition-all duration-300
                ${isActive ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <div className="w-2 h-2 bg-success rounded-full" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Encouraging Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          We're analyzing thousands of data points to find minds that truly resonate with yours...
        </p>
      </motion.div>
    </LoadingLayout>
  );
};

export default Processing;