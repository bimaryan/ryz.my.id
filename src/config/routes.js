import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import RedirectPage from '@/pages/RedirectPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ApiKeysPage from '@/pages/ApiKeysPage'
import SettingsPage from '@/pages/SettingsPage'
import CustomDomainsPage from '@/pages/CustomDomainsPage'
import WebhooksPage from '@/pages/WebhooksPage'
import TeamsPage from '@/pages/TeamsPage'
import LinksPage from '@/pages/LinksPage'
import DocsPage from '@/pages/DocsPage'

export const routes = [
  // Public routes
  {
    path: '/',
    element: HomePage,
    public: true,
  },
  {
    path: '/docs',
    element: DocsPage,
    public: true,
  },
  {
    path: '/login',
    element: LoginPage,
    public: true,
  },
  {
    path: '/signup',
    element: SignupPage,
    public: true,
  },
  {
    path: '/:slug',
    element: RedirectPage,
    public: true,
  },

  // Protected routes
  {
    path: '/dashboard',
    element: DashboardPage,
    protected: true,
  },
  {
    path: '/dashboard/links',
    element: LinksPage,
    protected: true,
  },
  {
    path: '/dashboard/analytics',
    element: AnalyticsPage,
    protected: true,
  },
  {
    path: '/dashboard/api-keys',
    element: ApiKeysPage,
    protected: true,
  },
  {
    path: '/dashboard/domains',
    element: CustomDomainsPage,
    protected: true,
  },
  {
    path: '/dashboard/webhooks',
    element: WebhooksPage,
    protected: true,
  },
  {
    path: '/dashboard/teams',
    element: TeamsPage,
    protected: true,
  },
  {
    path: '/dashboard/settings',
    element: SettingsPage,
    protected: true,
  },

  // Catch-all
  {
    path: '*',
    element: NotFoundPage,
  },
]
