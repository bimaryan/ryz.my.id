import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { Hexagon, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#0b5cff]/20 relative overflow-hidden">
      <SEO title="Kebijakan Privasi | RYZLink" />

      {/* Decorative bg */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="font-extrabold text-xl font-sans tracking-wide">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                RYZ<span className="text-[#0b5cff]">Link</span>
              </span>
            </Link>
            <Link to="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-4 sm:pt-40 sm:pb-32 z-10 animate-fade-in-up">
        <div className="mx-auto max-w-3xl bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[32px] shadow-xl border border-slate-200/60">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-4">Kebijakan Privasi</h1>
          <p className="text-slate-500 font-bold mb-10">Pembaruan terakhir: 17 Juni 2026</p>

          <div className="prose prose-slate max-w-none text-slate-600 font-medium space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="mb-2">
                Saat Anda menggunakan RYZLink, kami dapat mengumpulkan jenis informasi berikut:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-[#0b5cff]">
                <li><strong className="text-slate-800">Informasi Akun:</strong> Nama, alamat email, dan data autentikasi yang diberikan saat pendaftaran.</li>
                <li><strong className="text-slate-800">Data Penggunaan:</strong> Informasi tentang bagaimana Anda berinteraksi dengan Layanan kami, termasuk tautan yang dibuat dan kunjungan halaman.</li>
                <li><strong className="text-slate-800">Data Analitik:</strong> Alamat IP, jenis browser, dan informasi perangkat pengguna yang mengklik tautan pendek Anda.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
              <p className="mb-2">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-[#0b5cff]">
                <li>Menyediakan, memelihara, dan meningkatkan Layanan kami.</li>
                <li>Memproses transaksi Anda dan mengelola akun Anda.</li>
                <li>Memberikan analitik mendetail mengenai tautan dan halaman pendek Anda.</li>
                <li>Berkomunikasi dengan Anda mengenai pembaruan, peringatan keamanan, dan pesan dukungan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. Berbagi dan Pengungkapan Data</h2>
              <p>
                Kami tidak menjual informasi pribadi Anda. Kami dapat membagikan data dengan penyedia layanan pihak ketiga (seperti penyedia hosting dan layanan analitik) semata-mata untuk tujuan mengoperasikan Layanan kami. Kami juga dapat mengungkapkan informasi jika diwajibkan oleh hukum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Keamanan Data</h2>
              <p>
                Kami menerapkan langkah-langkah keamanan standar industri untuk melindungi informasi pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah. Namun, tidak ada metode transmisi melalui internet yang 100% aman.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Hak-Hak Anda</h2>
              <p>
                Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda kapan saja dengan masuk ke pengaturan akun Anda. Anda juga dapat menghubungi kami untuk meminta penghapusan data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">6. Perubahan Kebijakan Ini</h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-[15px] font-bold text-slate-500">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di <a href="mailto:privacy@ryz.my.id" className="text-[#0b5cff] hover:underline">privacy@ryz.my.id</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
