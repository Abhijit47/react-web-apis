import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('blog', 'routes/blog.tsx'),
  route(
    '/.well-known/appspecific/com.chrome.devtools.json',
    'routes/devtools.tsx'
  ),
  route('/action/set-theme', 'routes/action.set-theme.ts'),
] satisfies RouteConfig;
