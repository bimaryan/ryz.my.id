import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactsTab({ user, API_URL }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) loadContacts();
  }, [user]);

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
      const res = await fetch(`${API_URL}/whatsapp/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name: newName.trim(), phone: newPhone.trim() }),
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

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Hapus kontak ini?")) return;
    try {
      const res = await fetch(`${API_URL}/whatsapp/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Kontak dihapus");
        loadContacts();
      }
    } catch (err) {
      toast.error("Gagal menghapus kontak");
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
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
