import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { Hexagon, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
      <SEO title="Terms of Service | RYZLink" />

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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium mb-10">Last updated: June 17, 2026</p>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using RYZLink ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>

            <h2 className="text-xl font-bold text-slate-900">2. Description of Service</h2>
            <p>
              RYZLink provides URL shortening, Link-in-Bio pages, and QR code generation services. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice.
            </p>

            <h2 className="text-xl font-bold text-slate-900">3. Acceptable Use</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Link to malicious content, spam, or phishing sites.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe upon the intellectual property rights of others.</li>
              <li>Distribute inappropriate, offensive, or explicit material.</li>
            </ul>
            <p>
              We reserve the right to disable or delete any links or accounts that violate these terms.
            </p>

            <h2 className="text-xl font-bold text-slate-900">4. Account Registration</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              RYZLink is provided on an "as is" and "as available" basis. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>

            <h2 className="text-xl font-bold text-slate-900">6. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                If you have any questions about these Terms, please contact us at support@ryz.my.id.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
