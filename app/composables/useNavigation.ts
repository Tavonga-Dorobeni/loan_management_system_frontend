export const useNavigation = () => {
  const router = useRouter();

  const goToDashboard = async () => {
    await router.push('/dashboard');
  };

  const goToLogin = async () => {
    await router.push('/auth/login');
  };

  const goToOnboarding = async () => {
    await router.push('/onboarding/welcome');
  };

  return {
    goToDashboard,
    goToLogin,
    goToOnboarding
  };
};
