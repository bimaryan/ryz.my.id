import React, { useState, useEffect } from 'react';
import { Globe, Trash2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useDnsRecords } from '@/hooks/useDnsRecords';
import toast from 'react-hot-toast';

export default function DomainDnsManager({ domain, handleDeleteDomain }) {
  const { records, isLoading, error, fetchRecords, addRecord, deleteRecord } = useDnsRecords();
  const [copiedText, setCopiedText] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState(60);
  const [priority, setPriority] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (domain?.id) {
      fetchRecords(domain.id);
    }
  }, [domain?.id, fetchRecords]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleAddRecord = async () => {
    if (!name || !value) {
      toast.error('Name dan Value wajib diisi!');
      return;
    }

    if (type === 'MX' && !priority) {
      toast.error('Priority wajib diisi untuk record MX!');
      return;
    }

    setIsSubmitting(true);
    const { success, error: err } = await addRecord({
      domain_id: domain.id,
      name,
      type,
      value,
      ttl: parseInt(ttl) || 60,
      priority: type === 'MX' ? parseInt(priority) : null,
      comment
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('DNS Record berhasil ditambahkan!');
      setName('');
      setValue('');
      setComment('');
      if (type === 'MX') setPriority('');
    } else {
      toast.error('Gagal menambahkan DNS Record: ' + err);
    }
  };

  const handleRemoveRecord = async (recordId) => {
    if (!window.confirm('Yakin ingin menghapus record ini?')) return;
    
    const { success, error: err } = await deleteRecord(recordId);
    if (success) {
      toast.success('DNS Record berhasil dihapus!');
    } else {
      toast.error('Gagal menghapus DNS Record: ' + err);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-blue-300 transition-all">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <Globe className="w-5 h-5 text-[#0b5cff]" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {domain.domain}
            </h4>
            <p className="text-sm text-slate-500">Ditambahkan pada {new Date(domain.created_at).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
            Menunggu DNS
          </span>
          <button 
            onClick={() => handleDeleteDomain(domain.id, domain.domain)}
            className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors inline-flex items-center"
            title="Hapus Domain"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50/30">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">DNS Records</h3>
          <p className="text-sm text-slate-600 mb-4">
            DNS records point to services your domain uses, like forwarding your domain or setting up an email service. You can enable RYZ's nameservers or use a third-party to manage your domain's DNS records.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-3">
            <div className="text-amber-500 mt-0.5"><AlertCircle className="w-5 h-5" /></div>
            <div className="text-sm text-amber-800">
              Update the nameservers in your DNS provider to manage your DNS records on RYZ.
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden mb-8">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Nameservers</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                <code className="text-sm font-mono text-slate-700">ns1.ryz.my.id</code>
                <button type="button" onClick={() => handleCopy('ns1.ryz.my.id')} className="text-slate-400 hover:text-slate-600">
                  {copiedText === 'ns1.ryz.my.id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                <code className="text-sm font-mono text-slate-700">ns2.ryz.my.id</code>
                <button type="button" onClick={() => handleCopy('ns2.ryz.my.id')} className="text-slate-400 hover:text-slate-600">
                  {copiedText === 'ns2.ryz.my.id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
              It might take some time for the nameservers changes to apply.
            </div>
          </div>

          {/* ADD RECORD FORM */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden mb-6">
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="subdomain or @" className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Type</label>
                <select value={type} onChange={e => { setType(e.target.value); if(e.target.value !== 'MX') setPriority(''); }} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-bold">
                  <option value="A">A</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Value</label>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'A' ? "165.101.230.119" : "target.com"} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">TTL</label>
                <input type="number" value={ttl} onChange={e => setTtl(e.target.value)} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Priority</label>
                <input type="number" value={priority} onChange={e => setPriority(e.target.value)} disabled={type !== 'MX'} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" />
              </div>
              <div className="md:col-span-12">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Comment</label>
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="A comment explaining what this DNS record is for" className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#0b5cff] font-medium hover:underline cursor-pointer">Learn more about DNS Records ↗</span>
              <button 
                type="button" 
                onClick={handleAddRecord}
                disabled={isSubmitting}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-800 text-sm font-bold py-1.5 px-6 rounded-md transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add
              </button>
            </div>
          </div>

          {/* RECORDS LIST */}
          {isLoading && records.length === 0 ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#0b5cff]" /></div>
          ) : records.length > 0 ? (
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Value</th>
                    <th className="px-4 py-3 font-bold">TTL</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-700">{record.type}</td>
                      <td className="px-4 py-3 font-mono">{record.name}</td>
                      <td className="px-4 py-3 font-mono truncate max-w-[200px]" title={record.value}>
                        {record.priority ? `${record.priority} ` : ''}{record.value}
                        {record.comment && <span className="block text-xs text-slate-400 font-sans mt-0.5">{record.comment}</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{record.ttl}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleRemoveRecord(record.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
