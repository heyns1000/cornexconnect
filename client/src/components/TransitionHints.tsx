import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Info, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface HintStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  type: 'info' | 'success' | 'warning' | 'tip';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface TransitionHintsProps {
  steps: HintStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
}

export function TransitionHints({
  steps,
  isVisible,
  onComplete,
  onSkip,
  currentStep = 0
}: TransitionHintsProps) {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  const currentHint = steps[activeStep];

  useEffect(() => {
    if (currentHint?.targetElement && isVisible) {
      const element = document.querySelector(currentHint.targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Add highlight effect
        element.classList.add('hint-target');
        setTimeout(() => element.classList.remove('hint-target'), 3000);
      }
    }
  }, [activeStep, currentHint, isVisible]);

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onComplete();
    }
  };

  const previousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const getHintIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getHintPosition = () => {
    if (!targetPosition) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const { x, y } = targetPosition;
    const offset = 20;
    
    switch (currentHint.position) {
      case 'top':
        return { top: y - offset, left: x, transform: 'translate(-50%, -100%)' };
      case 'bottom':
        return { top: y + offset, left: x, transform: 'translate(-50%, 0%)' };
      case 'left':
        return { top: y, left: x - offset, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { top: y, left: x + offset, transform: 'translate(0%, -50%)' };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  if (!isVisible || !currentHint) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999]"
        onClick={onSkip}
      />
      
      {/* Target Spotlight */}
      {targetPosition && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed w-24 h-24 rounded-full border-4 border-emerald-400 pointer-events-none z-[10000]"
          style={{
            left: targetPosition.x - 48,
            top: targetPosition.y - 48,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }}
        />
      )}

      {/* Hint Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        className="fixed z-[10001] max-w-sm"
        style={getHintPosition()}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border border-emerald-200 dark:border-emerald-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getHintIcon(currentHint.type)}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {currentHint.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {currentHint.description}
            </p>

            {/* Action Button */}
            {currentHint.action && (
              <div className="mb-4">
                <Button
                  onClick={currentHint.action.onClick}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                >
                  {currentHint.action.text}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeStep 
                        ? 'bg-emerald-500' 
                        : index < activeStep 
                          ? 'bg-emerald-300' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {activeStep > 0 && (
                  <Button variant="outline" size="sm" onClick={previousStep}>
                    Previous
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                >
                  {activeStep < steps.length - 1 ? (
                    <>
                      Next <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              </div>
            </div>

            {/* Step Counter */}
            <div className="text-xs text-gray-500 text-center mt-3">
              Step {activeStep + 1} of {steps.length}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <style>{`
        .hint-target {
          animation: hint-pulse 2s ease-in-out;
          position: relative;
          z-index: 10000;
        }
        
        @keyframes hint-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% { 
            box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </>
  );
}

// Hook for managing transition hints
export function useTransitionHints() {
  const [activeHints, setActiveHints] = useState<HintStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const showHints = (steps: HintStep[]) => {
    setActiveHints(steps);
    setCurrentStep(0);
    setIsVisible(true);
  };

  const hideHints = () => {
    setIsVisible(false);
    setActiveHints([]);
    setCurrentStep(0);
  };

  const completeHints = () => {
    hideHints();
  };

  return {
    activeHints,
    isVisible,
    currentStep,
    showHints,
    hideHints,
    completeHints
  };
}

// Predefined hint sequences for common workflows
export const HINT_SEQUENCES = {
  bulkImport: [
    {
      id: 'welcome',
      title: 'Welcome to Bulk Import',
      description: 'This powerful tool helps you import multiple Excel files with different structures into one organized database.',
      type: 'info' as const,
      position: 'center' as const
    },
    {
      id: 'drag-drop',
      title: 'Drag & Drop Files',
      description: 'Simply drag your Excel files here or click to browse. The system automatically detects different column structures.',
      targetElement: '[data-hint="file-drop-zone"]',
      type: 'tip' as const,
      position: 'bottom' as const
    },
    {
      id: 'processing',
      title: 'Smart Processing',
      description: 'Files are processed with intelligent column mapping and duplicate detection. All data is organized by province and town.',
      type: 'info' as const,
      position: 'center' as const
    },
    {
      id: 'history',
      title: 'Import History',
      description: 'View all your import sessions here. Each session shows detailed statistics and processing results.',
      targetElement: '[data-hint="import-history"]',
      type: 'success' as const,
      position: 'top' as const
    }
  ],
  
  dashboard: [
    {
      id: 'overview',
      title: 'Your Business Dashboard',
      description: 'Monitor your entire Cornex manufacturing and distribution network from this central hub.',
      type: 'info' as const,
      position: 'center' as const
    },
    {
      id: 'metrics',
      title: 'Real-time Metrics',
      description: 'Track revenue, distributor performance, and production schedules in real-time across all provinces.',
      targetElement: '[data-hint="dashboard-metrics"]',
      type: 'success' as const,
      position: 'bottom' as const
    },
    {
      id: 'regions',
      title: 'Regional Performance',
      description: 'Analyze sales performance by region with detailed breakdowns for each province and major cities.',
      targetElement: '[data-hint="regional-chart"]',
      type: 'tip' as const,
      position: 'left' as const
    }
  ],

  factorySetup: [
    {
      id: 'ai-factory',
      title: 'AI-Powered Factory Setup',
      description: 'Configure your manufacturing facilities with AI-driven optimization recommendations.',
      type: 'info' as const,
      position: 'center' as const
    },
    {
      id: 'equipment',
      title: 'Equipment Configuration',
      description: 'Add and configure your manufacturing equipment. The AI will suggest optimal production schedules.',
      targetElement: '[data-hint="equipment-setup"]',
      type: 'tip' as const,
      position: 'right' as const
    },
    {
      id: 'optimization',
      title: 'Production Optimization',
      description: 'AI algorithms analyze your setup and provide recommendations for maximum efficiency and cost reduction.',
      type: 'success' as const,
      position: 'center' as const
    }
  ]
};