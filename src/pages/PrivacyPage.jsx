import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { Hexagon, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
      <SEO title="Privacy Policy | RYZLink" />

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-indigo-500/25 transition-all">
                <Hexagon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                RYZLink
              </span>
            </Link>
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-4 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/60">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium mb-10">Last updated: June 17, 2026</p>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you use RYZLink, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication data provided during signup.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our Service, including created links and page visits.</li>
              <li><strong>Analytics Data:</strong> IP addresses, browser types, and device information of users who click on your shortened links.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve our Service.</li>
              <li>Process your transactions and manage your account.</li>
              <li>Provide detailed analytics regarding your shortened links and pages.</li>
              <li>Communicate with you regarding updates, security alerts, and support messages.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share data with third-party service providers (like hosting providers and analytics services) solely for the purpose of operating our Service. We may also disclose information if required by law.
            </p>

            <h2 className="text-xl font-bold text-slate-900">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-xl font-bold text-slate-900">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time by logging into your account settings. You may also contact us to request data deletion.
            </p>

            <h2 className="text-xl font-bold text-slate-900">6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                If you have any questions about this Privacy Policy, please contact us at privacy@ryz.my.id.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
