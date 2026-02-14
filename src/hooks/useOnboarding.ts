import { useState, useEffect } from 'react';

export type OnboardingStep = 
  | 'idle' 
  | 'setup_team_count' 
  | 'setup_team_config' 
  | 'game_start' 
  | 'game_move_piece' 
  | 'game_next_turn'
  | 'completed';

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('idle');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('yutnori_onboarding_completed') === 'true';
    if (!isCompleted) {
      // 시작점 결정 (URL에 따라)
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setCurrentStep('setup_team_count');
        setIsVisible(true);
      } else if (path === '/game') {
        setCurrentStep('game_start');
        setIsVisible(true);
      }
    }
  }, []);

  const completeStep = (step: OnboardingStep) => {
    if (currentStep === step) {
      // 다음 단계로 매핑
      const nextStepMap: Record<OnboardingStep, OnboardingStep> = {
        'idle': 'idle',
        'setup_team_count': 'setup_team_config',
        'setup_team_config': 'completed', // 설정화면 완료
        'game_start': 'game_move_piece',
        'game_move_piece': 'game_next_turn',
        'game_next_turn': 'completed',
        'completed': 'completed'
      };
      
      const next = nextStepMap[step];
      setCurrentStep(next);
      
      if (next === 'completed') {
        const path = window.location.pathname;
        if (path === '/game') {
          localStorage.setItem('yutnori_onboarding_completed', 'true');
          setIsVisible(false);
        }
      }
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('yutnori_onboarding_completed', 'true');
    setIsVisible(false);
    setCurrentStep('completed');
  };

  return {
    currentStep,
    isVisible,
    completeStep,
    skipOnboarding
  };
};
