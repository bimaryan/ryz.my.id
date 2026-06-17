import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Lock, ArrowRight } from 'lucide-react'

// Simple User Agent Parser
const parseUserAgent = (ua) => {
  let browser = 'Unknown'
  let os = 'Unknown'
  
  if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/edg/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac/i.test(ua)) os = 'MacOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS'

  return { browser, os }
}

export default function RedirectPage() {
  const { slug } = useParams()
  const [error, setError] = useState(null)
  const [linkData, setLinkData] = useState(null)
  
  // Password State
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const { data: link, error: fetchError } = await supabase
          .from('links')
          .select('*')
          .or(`short_code.eq.${slug},custom_slug.eq.${slug}`)
          .single()

        if (fetchError || !link) {
          setError('Link not found')
          return
        }

        if (!link.is_active) {
          setError('This link is no longer active')
          return
        }

        // 1. Check Expiration
        if (link.expires_at && new Date() > new Date(link.expires_at)) {
          setError('This link has expired')
          return
        }

        // 2. Check Password
        if (link.password_hash) {
          setLinkData(link)
          setRequiresPassword(true)
          return // Stop here, wait for user input
        }

        // 3. Execute Redirect
        executeRedirect(link)

      } catch (err) {
        console.error('Fetch error:', err)
        setError('Something went wrong')
      }
    }

    if (slug) fetchLink()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const executeRedirect = async (link) => {
    try {
      // 1. Increment click count
      await supabase
        .from('links')
        .update({ clicks_count: (link.clicks_count || 0) + 1 })
        .eq('id', link.id)

      // 2. Record analytics (with expanded OS/Browser parsing)
      const { browser, os } = parseUserAgent(navigator.userAgent)
      const device_type = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : /Tablet|iPad/i.test(navigator.userAgent) ? 'tablet' : 'desktop'

      await supabase
        .from('analytics')
        .insert([{
          link_id: link.id,
          referrer: document.referrer || '(direct)',
          user_agent: navigator.userAgent,
          device_type,
          browser,
          os,
          utm_source: link.utm_source,
          utm_medium: link.utm_medium,
          utm_campaign: link.utm_campaign
        }])

      // 3. Append UTM parameters to URL if they exist
      let finalUrl = link.original_url
      if (link.utm_source || link.utm_medium || link.utm_campaign) {
        try {
          const urlObj = new URL(finalUrl)
          if (link.utm_source) urlObj.searchParams.set('utm_source', link.utm_source)
          if (link.utm_medium) urlObj.searchParams.set('utm_medium', link.utm_medium)
          if (link.utm_campaign) urlObj.searchParams.set('utm_campaign', link.utm_campaign)
          finalUrl = urlObj.toString()
        } catch (e) {
          console.warn('Could not parse original URL to append UTMs', e)
        }
      }

      // 4. Redirect
      window.location.replace(finalUrl)
    } catch (err) {
      console.error('Analytics error:', err)
      // Still attempt redirect even if tracking fails
      window.location.replace(link.original_url)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    // For MVP, we compare plaintext since we didn't implement backend bcrypt hashing
    // In production, you would call a Supabase Edge Function to verify the hash.
    if (passwordInput === linkData.password_hash) {
      setRequiresPassword(false)
      executeRedirect(linkData)
    } else {
      setPasswordError(true)
      setPasswordInput('')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <h1 className="text-4xl font-black text-red-500 mb-4">404</h1>
          <p className="text-slate-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Protected Link</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">Please enter the password to proceed to the destination.</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  setPasswordError(false)
                }}
                className={`w-full h-12 px-4 rounded-lg border text-slate-900 bg-slate-50 focus:outline-none focus:bg-white transition-colors ${
                  passwordError ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-[#0b5cff] focus:ring-2 focus:ring-[#0b5cff]/20'
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-2 font-medium text-center">Incorrect password. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full h-12 bg-[#0b5cff] hover:bg-[#094bdd] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center font-sans">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-xl bg-[#0b5cff]/10 border border-[#0b5cff]/20 mb-4 animate-spin" />
        <p className="text-slate-500 font-bold tracking-wide">Redirecting...</p>
      </div>
    </div>
  )
}
