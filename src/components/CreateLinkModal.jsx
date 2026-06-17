import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link2, Shield, X } from 'lucide-react'
import { useLinks } from '@/hooks/useLinks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const linkSchema = z.object({
  original_url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
  custom_slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  password: z.string().optional(),
  expires_at: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export default function CreateLinkModal({ isOpen, onClose, onSuccess }) {
  const { createLink } = useLinks()
  const [activeTab, setActiveTab] = useState('basic')
  const [createError, setCreateError] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(linkSchema),
  })

  if (!isOpen) return null

  const onSubmitNewLink = async (data) => {
    setCreateError(null)
    const res = await createLink(data)
    if (res.success) {
      reset()
      setActiveTab('basic')
      onSuccess?.()
      onClose()
    } else {
      setCreateError(res.error)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'org', label: 'Organization' },
    { id: 'security', label: 'Security' },
    { id: 'utm', label: 'Marketing (UTM)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-fade-in-up my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="text-[#0b5cff] h-5 w-5" /> Create New Link
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit(onSubmitNewLink)} className="p-6">
          <div className="min-h-[250px]">
            <div className={`space-y-5 animate-fade-in-up ${activeTab === 'basic' ? 'block' : 'hidden'}`}>
              <Input label={<span className="text-slate-700 font-bold">Destination URL <span className="text-red-500">*</span></span>} placeholder="https://example.com/very/long/url" error={errors.original_url?.message} {...register('original_url')} className="bitly-input" />
              <div className="grid grid-cols-2 gap-4">
                <Input label={<span className="text-slate-700 font-bold">Title (Internal)</span>} placeholder="Summer Campaign 2026" error={errors.title?.message} {...register('title')} className="bitly-input" />
                <Input label={<span className="text-slate-700 font-bold">Custom Slug</span>} placeholder="summer26" error={errors.custom_slug?.message} {...register('custom_slug')} className="bitly-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea {...register('description')} rows={3} className="bitly-input resize-none" placeholder="Brief note about this link..."></textarea>
              </div>
            </div>

            <div className={`space-y-5 animate-fade-in-up ${activeTab === 'org' ? 'block' : 'hidden'}`}>
              <Input label={<span className="text-slate-700 font-bold">Category</span>} placeholder="e.g. Marketing, Sales, Personal" error={errors.category?.message} {...register('category')} className="bitly-input" />
              <Input label={<span className="text-slate-700 font-bold">Tags (Comma separated)</span>} placeholder="promo, social, 2026" error={errors.tags?.message} {...register('tags')} className="bitly-input" />
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-700">Tags and Categories help you filter your links easily on the dashboard.</p>
              </div>
            </div>

            <div className={`space-y-5 animate-fade-in-up ${activeTab === 'security' ? 'block' : 'hidden'}`}>
              <Input type="password" label={<span className="text-slate-700 font-bold">Password Protection</span>} placeholder="Leave blank for public access" error={errors.password?.message} {...register('password')} className="bitly-input" />
              <Input type="datetime-local" label={<span className="text-slate-700 font-bold">Expiration Date</span>} error={errors.expires_at?.message} {...register('expires_at')} className="bitly-input" />
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
                <Shield className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800">Links with password protection require users to enter the password before being redirected to the destination.</p>
              </div>
            </div>

            <div className={`space-y-5 animate-fade-in-up ${activeTab === 'utm' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-2 gap-4">
                <Input label={<span className="text-slate-700 font-bold">UTM Source</span>} placeholder="e.g. facebook" error={errors.utm_source?.message} {...register('utm_source')} className="bitly-input" />
                <Input label={<span className="text-slate-700 font-bold">UTM Medium</span>} placeholder="e.g. social" error={errors.utm_medium?.message} {...register('utm_medium')} className="bitly-input" />
              </div>
              <Input label={<span className="text-slate-700 font-bold">UTM Campaign</span>} placeholder="e.g. summer_sale_2026" error={errors.utm_campaign?.message} {...register('utm_campaign')} className="bitly-input" />
              <p className="text-xs text-slate-500 mt-2 font-medium">These parameters will be automatically appended to your destination URL.</p>
            </div>
          </div>

          {createError && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              {createError}
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Free plan limits apply. <a href="#" className="text-[#0b5cff] font-bold">Upgrade</a></p>
            <div className="flex gap-3">
              <Button type="button" onClick={onClose} className="bitly-button-secondary">Cancel</Button>
              <Button type="submit" isLoading={isSubmitting} className="bitly-button-primary">Create Link</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
