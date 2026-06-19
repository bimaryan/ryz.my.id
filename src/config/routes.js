import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import RedirectPage from '@/pages/RedirectPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ApiKeysPage from '@/pages/ApiKeysPage'
import SettingsPage from '@/pages/SettingsPage'
import CustomDomainsPage from '@/pages/CustomDomainsPage'
import WebhooksPage from '@/pages/WebhooksPage'
import TeamsPage from '@/pages/TeamsPage'
import TeamDetailsPage from '@/pages/TeamDetailsPage'
import PagesPage from '@/pages/PagesPage'
import PageEditor from '@/pages/PageEditor'
import PublicPage from '@/pages/PublicPage'
import BlogPublicPage from '@/pages/BlogPublicPage'
import LinksPage from '@/pages/LinksPage'
import DocsPage from '@/pages/DocsPage'
import OrderTrackingSearchPage from '@/pages/OrderTrackingSearchPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import FormsPage from '@/pages/FormsPage'
import FormBuilderPage from '@/pages/FormBuilderPage'
import PublicFormPage from '@/pages/PublicFormPage'

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
    path: '/forgot-password',
    element: ForgotPasswordPage,
    public: true,
  },
  {
    path: '/reset-password',
    element: ResetPasswordPage,
    public: true,
  },
  {
    path: '/p/:slug',
    element: PublicPage,
    public: true,
  },
  {
    path: '/f/:id',
    element: PublicFormPage,
    public: true,
  },
  {
    path: '/:slug/blog/:blogId',
    element: BlogPublicPage,
    public: true,
  },
  {
    path: '/track',
    element: OrderTrackingSearchPage,
    public: true,
  },
  {
    path: '/track/:orderId',
    element: OrderTrackingPage,
    public: true,
  },
  {
    path: '/terms',
    element: TermsPage,
    public: true,
  },
  {
    path: '/privacy',
    element: PrivacyPage,
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
    path: '/dashboard/teams/:id',
    element: TeamDetailsPage,
    protected: true,
  },
  {
    path: '/dashboard/settings',
    element: SettingsPage,
    protected: true,
  },
  {
    path: '/dashboard/pages',
    element: PagesPage,
    protected: true,
  },
  {
    path: '/dashboard/pages/:id',
    element: PageEditor,
    protected: true,
  },
  {
    path: '/dashboard/orders',
    element: OrdersPage,
    protected: true,
  },
  {
    path: '/dashboard/forms',
    element: FormsPage,
    protected: true,
  },
  {
    path: '/dashboard/forms/:id/edit',
    element: FormBuilderPage,
    protected: true,
  },

  // Catch-all
  {
    path: '*',
    element: NotFoundPage,
  },
]
