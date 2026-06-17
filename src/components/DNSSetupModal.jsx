import { X, Copy, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DNSSetupModal({ isOpen, onClose, domain }) {
  const [copiedType, setCopiedType] = useState(null)

  if (!isOpen || !domain) return null

  const records = [
    { type: 'A', name: '@', value: '76.76.21.21' }, // Standard dummy IP for Vercel/similar
    { type: 'CNAME', name: 'www', value: 'cname.ryz.my.id' }
  ]

  // If it's a subdomain, we just need a CNAME for that subdomain
  const isSubdomain = domain.domain.split('.').length > 2
  const subdomainPrefix = isSubdomain ? domain.domain.split('.')[0] : null

  const activeRecords = isSubdomain 
    ? [{ type: 'CNAME', name: subdomainPrefix, value: 'cname.ryz.my.id' }]
    : records

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    toast.success('Record copied to clipboard!')
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">DNS Configuration</h3>
            <p className="text-sm font-medium text-slate-500">Configure your domain registrar for {domain.domain}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-700 mb-4 font-medium">
              Log in to your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare) and add the following DNS records. 
              If you have existing A or CNAME records for this specific hostname, you must remove them first.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-900">Type</th>
                    <th className="px-4 py-3 font-bold text-slate-900">Name</th>
                    <th className="px-4 py-3 font-bold text-slate-900">Value (Target)</th>
                    <th className="px-4 py-3 font-bold text-slate-900 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRecords.map((record, idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#0b5cff]">{record.type}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{record.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-700 break-all">{record.value}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleCopy(record.value, `${record.type}-${idx}`)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                            copiedType === `${record.type}-${idx}`
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {copiedType === `${record.type}-${idx}` ? (
                            <><CheckCircle2 className="h-3 w-3" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copy Value</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="text-amber-800 font-bold text-sm mb-1">DNS Propagation</h4>
            <p className="text-amber-700 text-xs leading-relaxed">
              It can take up to 48 hours for DNS changes to propagate globally, though it usually happens within a few minutes. 
              Once verified, the status will automatically change to Verified in your dashboard.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} className="bitly-button-primary">I've Added the Records</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
