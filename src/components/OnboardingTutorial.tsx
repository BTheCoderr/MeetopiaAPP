import React, { useState, useEffect } from 'react';

// Bump the version whenever the tutorial describes a new product flow, so
// returning members see the current experience instead of the old one.
export const TUTORIAL_STORAGE_KEY = 'meetopia_tutorial_v2_completed';

interface TutorialStep {
  eyebrow: string;
  title: string;
  description: string;
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    eyebrow: 'Chemistry Passport',
    title: 'Start with common ground',
    description:
      'Your Chemistry Passport holds a few interests and what you are looking for. Introductions are based on what you share, not random matching.',
  },
  {
    eyebrow: 'Mutual consent',
    title: 'Both of you say yes before video',
    description:
      'When someone shares your common ground, you both see why you were introduced. Video starts only after you both accept. Choose "Not this introduction" any time.',
  },
  {
    eyebrow: 'Vibe Room',
    title: 'Do something together',
    description:
      'Each Vibe Room is a short session with Spark Cards and shared activities, so the conversation has something to build on. Pick a themed Vibe Session if you want a specific kind of meetup.',
  },
  {
    eyebrow: 'Meaningful Connections',
    title: 'Connect only if it is mutual',
    description:
      'After the final round, send a Vibe if you want to stay in touch. A Connection is saved only when you both Vibe. You can report, block, or go Back to Base at any time.',
  },
];

function markComplete(skipped: boolean) {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    if (skipped) localStorage.setItem('meetopia_tutorial_v2_skipped', 'true');
  } catch {
    // Storage can be unavailable (private mode); the tutorial simply shows again later.
  }
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const finish = (skipped: boolean) => {
    markComplete(skipped);
    onComplete();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish(false);
    }
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meetopia-tutorial-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#14141F] text-white shadow-2xl">
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
              {step.eyebrow}
            </p>
            <button
              type="button"
              onClick={() => finish(true)}
              className="text-sm text-white/55 hover:text-white"
            >
              Skip
            </button>
          </div>

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-xl font-black text-violet-200 ring-1 ring-violet-400/30">
            {currentStep + 1}
          </div>

          <h2 id="meetopia-tutorial-title" className="text-2xl font-black leading-tight">
            {step.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
            {step.description}
          </p>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex space-x-1.5" aria-label={`Step ${currentStep + 1} of ${tutorialSteps.length}`}>
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep ? 'w-6 bg-violet-400' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-2xl bg-violet-500 px-5 py-2.5 font-bold text-white transition-colors hover:bg-violet-400"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
