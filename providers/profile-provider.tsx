import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { getProfile, updateProfile, type Profile, type ProfileUpdate } from '@/lib/services/profile';
import { useAuth } from '@/providers/auth-provider';

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  saveProfile: (values: ProfileUpdate) => Promise<Profile>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setProfile(await getProfile());
    } catch (loadError) {
      console.error('Failed to load the authenticated profile.', loadError);
      setError('Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(async (values: ProfileUpdate) => {
    const updated = await updateProfile(values);
    setProfile(updated);
    setError(null);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ profile, loading, error, refreshProfile, saveProfile }),
    [error, loading, profile, refreshProfile, saveProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used inside ProfileProvider.');
  return context;
}
