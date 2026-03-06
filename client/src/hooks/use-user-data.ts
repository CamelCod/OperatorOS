import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

export function useUserData() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    setHasOnboarded, 
    setStats, 
    setEntries, 
    setDecisions, 
    isDemoMode 
  } = useStore();

  useEffect(() => {
    if (!user || authLoading || isDemoMode) {
      return;
    }

    // Load user data from API
    const loadData = async () => {
      try {
        const [stats, entries, decisions] = await Promise.all([
          api.getStats(),
          api.getEntries(),
          api.getDecisions()
        ]);

        setHasOnboarded(stats.hasOnboarded);
        setStats({
          streak: stats.streak,
          decisionsTracked: stats.decisionsTracked,
          contentPieces: stats.contentPieces
        });
        setEntries(entries);
        setDecisions(decisions);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadData();
  }, [user, authLoading, isDemoMode, setHasOnboarded, setStats, setEntries, setDecisions]);
}
