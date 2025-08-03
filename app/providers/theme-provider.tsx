// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.

import { useLoaderData } from 'react-router';
import { ThemeProvider } from 'remix-themes';
import type { loader } from '~/root';

// `themeAction` is the action name that's used to change the theme in the session storage.
export default function RemixThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction='/action/set-theme'>
      {children}
    </ThemeProvider>
  );
}
