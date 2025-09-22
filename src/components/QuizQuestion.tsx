import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'multi-select' | 'open';
  text: string;
  options?: string[];
  placeholder?: string;
}

export interface QuizAnswer {
  questionId: string;
  type: string;
  value: string | string[];
}

interface QuizQuestionProps {
  question: QuizQuestion;
  answer?: QuizAnswer;
  onChange: (answer: QuizAnswer) => void;
  className?: string;
  disabled?: boolean;
}

export const QuizQuestionComponent: React.FC<QuizQuestionProps> = ({
  question,
  answer,
  onChange,
  className,
  disabled = false
}) => {
  const [textValue, setTextValue] = useState(
    answer?.type === 'open' ? (answer.value as string) : ''
  );

  const handleMCQSelect = (option: string) => {
    if (disabled) return;
    onChange({
      questionId: question.id,
      type: question.type,
      value: option
    });
  };

  const handleMultiSelect = (option: string) => {
    if (disabled) return;
    const currentValues = (answer?.value as string[]) || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];
    
    onChange({
      questionId: question.id,
      type: question.type,
      value: newValues
    });
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    onChange({
      questionId: question.id,
      type: question.type,
      value
    });
  };

  const isSelected = (option: string) => {
    if (!answer) return false;
    if (question.type === 'mcq') {
      return answer.value === option;
    }
    if (question.type === 'multi-select') {
      return (answer.value as string[])?.includes(option) || false;
    }
    return false;
  };

  return (
    <Card className={cn('p-6 card-soft', className)}>
      {/* Question Text */}
      <h2 className="text-xl font-semibold text-foreground mb-6 leading-relaxed">
        {question.text}
      </h2>

      {/* Answer Options */}
      <div className="space-y-3">
        {/* Multiple Choice Questions */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={isSelected(option) ? "default" : "outline"}
                size="lg"
                className={cn(
                  'w-full justify-start text-left h-auto py-4 px-6 transition-all duration-200',
                  isSelected(option) 
                    ? 'bg-primary text-primary-foreground shadow-medium' 
                    : 'hover:bg-card-hover hover:shadow-soft',
                  disabled && 'opacity-50'
                )}
                onClick={() => handleMCQSelect(option)}
                disabled={disabled}
              >
                <span className="flex-1">{option}</span>
                {isSelected(option) && (
                  <Check className="w-5 h-5 ml-2 flex-shrink-0" />
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Multi-Select Questions */}
        {question.type === 'multi-select' && question.options && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Choose all that apply:
            </p>
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={isSelected(option) ? "default" : "outline"}
                size="lg"
                className={cn(
                  'w-full justify-start text-left h-auto py-4 px-6 transition-all duration-200',
                  isSelected(option) 
                    ? 'bg-primary text-primary-foreground shadow-medium' 
                    : 'hover:bg-card-hover hover:shadow-soft',
                  disabled && 'opacity-50'
                )}
                onClick={() => handleMultiSelect(option)}
                disabled={disabled}
              >
                <span className="flex-1">{option}</span>
                {isSelected(option) && (
                  <Check className="w-5 h-5 ml-2 flex-shrink-0" />
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Open Text Questions */}
        {question.type === 'open' && (
          <div className="space-y-4">
            <Textarea
              placeholder={question.placeholder || "Share your thoughts..."}
              value={textValue}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-32 resize-none shadow-soft border-border/50 focus:border-primary/50 focus:ring-primary/20"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Take your time — there are no right or wrong answers.
            </p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          No right answers — tell us how you think.
        </p>
      </div>
    </Card>
  );
};

// Quiz Progress Component
interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  current,
  total,
  className
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">
          Question {current} of {total}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 shadow-soft overflow-hidden">
        <div 
          className="gradient-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};