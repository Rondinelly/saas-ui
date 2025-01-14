import { RouteItem } from '@/docs/utils/get-route-context'

const sidebar = {
  routes: [
    {
      title: 'Overview',
      path: '/docs/pro/overview',
    },
    {
      title: 'Upgrading to v1',
      path: '/docs/pro/upgrading-to-v1',
    },
    {
      title: 'Project structure',
      path: '/docs/pro/project-structure',
    },
    {
      title: 'Installation',
      path: '/docs/pro/installation',
      open: true,
      heading: true,
      routes: [
        {
          title: 'Overview',
          path: '/docs/pro/installation/overview',
        },
        {
          title: 'Clone the repository',
          path: '/docs/pro/installation/clone-repository',
        },
        {
          title: 'Run the application',
          path: '/docs/pro/installation/run-application',
        },
        {
          title: 'NPM registry',
          path: '/docs/pro/installation/npm',
          heading: true,
          open: true,
          routes: [
            {
              title: 'NPM',
              path: '/docs/pro/installation/npm',
            },
            {
              title: 'Yarn',
              path: '/docs/pro/installation/yarn',
            },
            {
              title: 'Pnpm',
              path: '/docs/pro/installation/pnpm',
            },
            {
              title: 'Dependabot',
              path: '/docs/pro/installation/dependabot',
            },
          ],
        },
      ],
    },
    {
      title: 'Authentication',
      path: '/docs/pro/authentication',
      heading: true,
      open: true,
      routes: [
        {
          title: 'Overview',
          path: '/docs/pro/authentication',
        },
        {
          title: 'Providers',
          open: true,
          routes: [
            {
              title: 'Supabase',
              path: '/docs/pro/authentication/supabase',
            },
            {
              title: 'Clerk',
              path: '/docs/pro/authentication/clerk',
            },
            {
              title: 'Magic',
              path: '/docs/pro/authentication/magic',
            },
            {
              title: 'Auth.js (NextAuth)',
              path: '/docs/pro/authentication/authjs',
            },
          ],
        },
        {
          title: 'Customize auth screens',
          path: '/docs/pro/authentication/customize-auth-screens',
        },
      ],
    },
    {
      title: 'Theming',
      path: '/docs/pro/theming',
      heading: true,
      open: true,
      routes: [
        {
          title: 'Configuration',
          path: '/docs/pro/theming/configuration',
        },
        {
          title: 'Color schemes',
          path: '/docs/pro/theming/color-schemes',
        },
        {
          title: 'Fonts',
          path: '/docs/pro/theming/fonts',
        },
      ],
    },
    {
      title: 'Deployments',
      path: '/docs/pro/deployments',
      heading: true,
      open: true,
      routes: [
        {
          title: 'Vercel',
          path: '/docs/pro/deployments/vercel',
        },
      ],
    },
  ] as RouteItem[],
}

export default sidebar
