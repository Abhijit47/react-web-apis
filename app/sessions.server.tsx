import { createCookieSessionStorage } from 'react-router';
import { createThemeSessionResolver } from 'remix-themes';

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === 'production';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'theme',
    path: '/',
    httpOnly: isProduction ? true : false,
    sameSite: 'lax',
    secrets: [
      'a242fcfc76da55c1fd67c45b306353d25b1a836a2d663e2906e08de7c4a7c57b',
    ],
    // Set domain and secure only if in production
    ...(isProduction
      ? { domain: 'your-production-domain.com', secure: true }
      : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
