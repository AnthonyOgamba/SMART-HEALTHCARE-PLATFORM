import { createContext, useContext, type PropsWithChildren } from 'react';

import { Palette } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

const AuthLightThemeContext = createContext(false);

export function AuthLightThemeProvider({ children }: PropsWithChildren) {
  return <AuthLightThemeContext.Provider value>{children}</AuthLightThemeContext.Provider>;
}

export function useScopedPalette() {
  const palette = usePalette();
  return useContext(AuthLightThemeContext) ? Palette.light : palette;
}
