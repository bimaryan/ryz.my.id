import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SEO from '@/components/SEO'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { usePlanLimits } from '@/hooks/useSharesAndPlans'
import { useLinks } from '@/hooks/useLinks'
import { useCustomDomains } from '@/hooks/useCustomDomains'
import { usePages } from '@/hooks/usePages'
import { User, Shield, MonitorSmartphone, Mail, CheckCircle2, CreditCard, UploadCloud, Loader2 } from 'lucide-react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  whatsapp_number: z.string().optional(),
})

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export default function SettingsPage() {
  const { user, updateProfile, updateEmail, updatePassword, isLoading } = useAuth()
  const { plans, fetchPlans, isLoading: isPlansLoading } = usePlanLimits()
  const { links, fetchLinks } = useLinks()
  const { domains, fetchDomains } = useCustomDomains()
  const { uploadImage } = usePages()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchLinks()
    fetchDomains()
  }, [fetchPlans, fetchLinks, fetchDomains])

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      whatsapp_number: user?.user_metadata?.whatsapp_number || '',
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        whatsapp_number: user.user_metadata?.whatsapp_number || '',
      })
    }
  }, [user, resetProfile])

  const onProfileSubmit = async (data) => {
    setSuccessMsg('')
    setErrorMsg('')
    
    // Update Name & WA Number
    if (data.full_name !== user?.user_metadata?.full_name || data.whatsapp_number !== user?.user_metadata?.whatsapp_number) {
      const res = await updateProfile({ 
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number
      })
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
    }
    
    // Update Email
    if (data.email !== user?.email) {
      const res = await updateEmail(data.email)
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
    }

    setSuccessMsg('Profile updated successfully! Note: Email changes may require confirmation.')
  }

  const onPasswordSubmit = async (data) => {
    setSuccessMsg('')
    setErrorMsg('')
    
    const res = await updatePassword(data.password)
    if (res.success) {
      setSuccessMsg('Password updated successfully!')
      resetPassword()
    } else {
      setErrorMsg(res.error)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB')
      return
    }

    setSuccessMsg('')
    setErrorMsg('')
    setIsUploadingAvatar(true)
    
    const res = await uploadImage(file)
    setIsUploadingAvatar(false)

    if (res.success) {
      const updateRes = await updateProfile({ avatar_url: res.url })
      if (updateRes.success) {
        setSuccessMsg('Avatar updated successfully!')
      } else {
        setErrorMsg(updateRes.error || 'Failed to update avatar in profile')
      }
    } else {
      setErrorMsg(res.error || 'Failed to upload avatar')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'devices', label: 'Connected Devices', icon: MonitorSmartphone },
    { id: 'preferences', label: 'Email Preferences', icon: Mail },
    { id: 'activity', label: 'Activity Log', icon: CheckCircle2 },
  ]

  return (
    <DashboardLayout>
      <SEO title="Settings | RYZ Shortlink" />

      <div className="flex-1 w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSuccessMsg('')
                        setErrorMsg('')
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-[#0b5cff]' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                </div>

                <div className="p-8">
                  {successMsg && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                      <p className="text-sm font-bold">{successMsg}</p>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6 max-w-md">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500 uppercase overflow-hidden shadow-sm border border-slate-200">
                          {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg cursor-pointer transition-colors ${isUploadingAvatar ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                            {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                          </label>
                          <p className="text-xs text-slate-500 mt-2 font-medium">Recommended size: 256x256px. Max: 2MB.</p>
                        </div>
                      </div>

                      <Input 
                        label={<span className="text-slate-700 font-bold">Full Name</span>} 
                        error={profileErrors.full_name?.message} 
                        {...registerProfile('full_name')} 
                        className="bitly-input" 
                      />
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <Input 
                          type="email"
                          error={profileErrors.email?.message} 
                          {...registerProfile('email')} 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                        <Input 
                          type="text"
                          placeholder="e.g. 628123456789"
                          error={profileErrors.whatsapp_number?.message} 
                          {...registerProfile('whatsapp_number')} 
                        />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Include country code (e.g. 62 for Indonesia). This will be used for your checkout links.</p>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <Button type="submit" isLoading={isProfileSubmitting || isLoading} className="bitly-button-primary">Save Changes</Button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'billing' && (
                    <div className="space-y-8 animate-fade-in-up">
                      <div className="bg-gradient-to-br from-[#0b5cff] to-[#094bdd] rounded-xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold mb-1 capitalize">{user?.user_metadata?.plan_type || 'Free'} Plan</h3>
                            <p className="text-blue-100 text-sm">You are currently on the {user?.user_metadata?.plan_type || 'free'} tier.</p>
                          </div>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">Active</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5">
                              <span>Links Created</span>
                              <span>{links.length} / {user?.user_metadata?.max_links || 100}</span>
                            </div>
                            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (links.length / (user?.user_metadata?.max_links || 100)) * 100)}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5">
                              <span>Custom Domains</span>
                              <span>{domains.length} / {user?.user_metadata?.max_custom_domains || 1}</span>
                            </div>
                            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (domains.length / (user?.user_metadata?.max_custom_domains || 1)) * 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Upgrade for more limits</h3>
                        <p className="text-slate-500 mb-6 font-medium">Get advanced analytics, custom domains, and team collaboration by upgrading your plan.</p>
                        
                        {isPlansLoading ? (
                          <div className="text-center py-4"><span className="text-slate-500 font-bold">Loading plans...</span></div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.filter(p => p.plan_name !== 'free').map((plan) => (
                              <div key={plan.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-[#0b5cff] transition-colors cursor-pointer relative overflow-hidden flex flex-col h-full">
                                {plan.plan_name === 'pro' && <div className="absolute top-0 right-0 bg-[#0b5cff] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAR</div>}
                                <h4 className="font-bold text-slate-900 mb-1 capitalize">{plan.plan_name}</h4>
                                <p className="text-xl font-extrabold text-[#0b5cff] mb-4">
                                  ${plan.plan_name === 'pro' ? '15' : '99'}<span className="text-sm font-medium text-slate-500">/mo</span>
                                </p>
                                <ul className="text-sm text-slate-600 space-y-2 mb-6 flex-1">
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.max_links === -1 ? 'Unlimited' : plan.max_links.toLocaleString()} Links</li>
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.max_custom_domains === -1 ? 'Unlimited' : plan.max_custom_domains} Custom Domains</li>
                                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {plan.max_team_members === 0 ? 'No Team Members' : `${plan.max_team_members} Team Members`}</li>
                                </ul>
                                <Button className={`w-full ${plan.plan_name === 'pro' ? 'bitly-button-primary' : 'bitly-button-secondary'}`}>
                                  {plan.plan_name === 'enterprise' ? 'Contact Sales' : `Upgrade to ${plan.plan_name.charAt(0).toUpperCase() + plan.plan_name.slice(1)}`}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6 max-w-md">
                      <Input 
                        label={<span className="text-slate-700 font-bold">New Password</span>} 
                        type="password" 
                        error={passwordErrors.password?.message} 
                        {...registerPassword('password')} 
                        className="bitly-input" 
                      />
                      <Input 
                        label={<span className="text-slate-700 font-bold">Confirm New Password</span>} 
                        type="password" 
                        error={passwordErrors.confirm_password?.message} 
                        {...registerPassword('confirm_password')} 
                        className="bitly-input" 
                      />

                      <div className="pt-4">
                        <Button type="submit" isLoading={isPasswordSubmitting || isLoading} className="bitly-button-primary">Update Password</Button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'devices' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-[#0b5cff] rounded-lg">
                            <MonitorSmartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Windows • Chrome</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Jakarta, Indonesia • Active now</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">Current Session</span>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-60">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
                            <MonitorSmartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Mac OS • Safari</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Singapore • Last active 2 days ago</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Revoke</Button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-bold text-slate-900">Marketing Emails</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Receive tips, offers, and product updates.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b5cff]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-bold text-slate-900">Weekly Reports</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Get a weekly summary of your link performance.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b5cff]"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border-l-4 border-[#0b5cff] bg-blue-50/50 rounded-r-lg">
                        <div className="h-8 w-8 rounded bg-white text-[#0b5cff] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-blue-100">Now</div>
                        <div>
                          <p className="text-sm text-slate-900">You updated your profile settings</p>
                          <p className="text-xs text-slate-500">Jakarta, ID • 192.168.1.1</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border-l-4 border-slate-200 hover:bg-slate-50 rounded-r-lg transition-colors">
                        <div className="h-8 w-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">2d</div>
                        <div>
                          <p className="text-sm text-slate-900">You created a new custom domain</p>
                          <p className="text-xs text-slate-500">Jakarta, ID • 192.168.1.1</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border-l-4 border-slate-200 hover:bg-slate-50 rounded-r-lg transition-colors">
                        <div className="h-8 w-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">5d</div>
                        <div>
                          <p className="text-sm text-slate-900">You signed in from a new device (Windows)</p>
                          <p className="text-xs text-slate-500">Jakarta, ID • 192.168.1.1</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  )
}
