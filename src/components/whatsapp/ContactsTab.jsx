import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';

export default function ContactsTab({ user, API_URL }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleteGroupModal, setDeleteGroupModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    if (user) {
      loadContacts();
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/contact-groups/${user.id}`);
      const data = await res.json();
      if (data.success) setGroups(data.data);
    } catch (err) {
      console.error("Error loading groups:", err);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/contact-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name: newGroupName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Grup berhasil dibuat!");
        setNewGroupName("");
        loadGroups();
      } else {
        toast.error("Gagal membuat grup");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupModal.id) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/contact-groups/${deleteGroupModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Grup dihapus");
        loadGroups();
        loadContacts(); // Refresh contacts as they might lose group_id constraint (or cascade delete)
      }
    } catch (err) {
      toast.error("Gagal menghapus grup");
    } finally {
      setDeleteGroupModal({ isOpen: false, id: null });
    }
  };

  const loadContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/contacts/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (err) {
      console.error("Error loading contacts:", err);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsLoading(true);
    try {
      const payload = { user_id: user.id, name: newName.trim(), phone: newPhone.trim() };
      if (selectedGroupId) payload.group_id = selectedGroupId;

      const res = await fetch(`${API_URL}/whatsapp/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Kontak berhasil ditambahkan!");
        setNewName("");
        setNewPhone("");
        loadContacts();
      } else {
        toast.error(data.error || "Gagal menambahkan kontak");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    }
    setIsLoading(false);
  };

  const handleDeleteContact = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/contacts/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Kontak dihapus");
        loadContacts();
      }
    } catch (err) {
      toast.error("Gagal menghapus kontak");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" /> Buku Telepon (Contacts)
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Simpan nomor pelanggan atau member Anda di sini agar mudah dikirimi pesan Broadcast nantinya.
      </p>

      <form onSubmit={handleAddContact} className="flex flex-col sm:flex-row gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nomor WA</label>
          <input
            type="text"
            placeholder="081234..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Grup (Opsional)</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">-- Tanpa Grup --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 h-[38px]"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </form>

      <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Kelola Grup Kontak</h3>
            <p className="text-xs text-slate-600">Buat grup untuk memudahkan pengiriman pesan broadcast.</p>
          </div>
          <form onSubmit={handleAddGroup} className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Nama Grup Baru" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full sm:w-48 px-3 py-1.5 border border-purple-200 rounded-lg text-sm"
            />
            <button type="submit" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 whitespace-nowrap">
              Tambah
            </button>
          </form>
        </div>
        
        {groups.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
            {groups.map(g => (
              <div key={g.id} className="flex items-center gap-1 bg-white border border-purple-200 px-2 py-1 rounded-md text-xs font-medium text-purple-800 shadow-sm">
                <span>{g.name}</span>
                <button 
                  onClick={() => setDeleteGroupModal({ isOpen: true, id: g.id })}
                  className="ml-1 text-purple-400 hover:text-red-500 transition-colors"
                  title="Hapus Grup"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Cari kontak..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredContacts.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-sm">Belum ada kontak tersimpan.</p>
        ) : (
          filteredContacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-sm">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{contact.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {contact.phone}
                    {contact.whatsapp_contact_groups?.name && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                        {contact.whatsapp_contact_groups.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: true, id: contact.id })}
                className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDeleteContact} 
        title="Hapus Kontak" 
        message="Apakah Anda yakin ingin menghapus kontak ini dari Buku Telepon Anda?"
        confirmText="Hapus Kontak" 
      />
      <ConfirmModal 
        isOpen={deleteGroupModal.isOpen} 
        onClose={() => setDeleteGroupModal({ isOpen: false, id: null })} 
        onConfirm={handleDeleteGroup} 
        title="Hapus Grup" 
        message="Menghapus grup tidak akan menghapus kontak di dalamnya, hanya label grupnya saja. Lanjutkan?"
        confirmText="Hapus Grup" 
      />
    </div>
  );
}
