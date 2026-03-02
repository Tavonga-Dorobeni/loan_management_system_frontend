export const useOnboardingStore = defineStore('onboarding', () => {
  const currentStep = ref(1);
  const completedSteps = ref<number[]>([]);

  const setStep = (step: number) => {
    currentStep.value = step;
  };

  const completeStep = (step: number) => {
    if (!completedSteps.value.includes(step)) {
      completedSteps.value.push(step);
    }
  };

  const reset = () => {
    currentStep.value = 1;
    completedSteps.value = [];
  };

  return {
    currentStep,
    completedSteps,
    setStep,
    completeStep,
    reset
  };
});
