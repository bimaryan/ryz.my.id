import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { Hexagon, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#0b5cff]/20 relative overflow-hidden">
      <SEO title="Syarat & Ketentuan | RYZLink" />

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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-4">Syarat & Ketentuan</h1>
          <p className="text-slate-500 font-bold mb-10">Pembaruan terakhir: 17 Juni 2026</p>

          <div className="prose prose-slate max-w-none text-slate-600 font-medium space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">1. Penerimaan Syarat</h2>
              <p>
                Dengan mengakses dan menggunakan RYZLink ("Layanan"), Anda setuju untuk terikat oleh Syarat Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan Layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">2. Deskripsi Layanan</h2>
              <p>
                RYZLink menyediakan layanan penyingkat URL, halaman Link-in-Bio, dan pembuatan kode QR. Kami berhak mengubah, menangguhkan, atau menghentikan bagian mana pun dari Layanan kapan saja tanpa pemberitahuan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">3. Penggunaan yang Dapat Diterima</h2>
              <p className="mb-2">Anda setuju untuk tidak menggunakan Layanan untuk:</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-[#0b5cff]">
                <li>Menautkan ke konten berbahaya, spam, atau situs phishing.</li>
                <li>Melanggar hukum atau peraturan yang berlaku.</li>
                <li>Melanggar hak kekayaan intelektual pihak lain.</li>
                <li>Mendistribusikan materi yang tidak pantas, menyinggung, atau eksplisit.</li>
              </ul>
              <p className="mt-4">
                Kami berhak menonaktifkan atau menghapus tautan atau akun apa pun yang melanggar ketentuan ini.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">4. Registrasi Akun</h2>
              <p>
                Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda dan atas semua aktivitas yang terjadi di bawah akun Anda. Anda harus segera memberi tahu kami tentang penggunaan akun Anda secara tidak sah.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">5. Batasan Tanggung Jawab</h2>
              <p>
                RYZLink disediakan "sebagaimana adanya" dan "sebagaimana tersedia". Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau hukuman yang diakibatkan oleh penggunaan atau ketidakmampuan Anda untuk menggunakan Layanan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-3">6. Perubahan Ketentuan</h2>
              <p>
                Kami berhak memperbarui Syarat Ketentuan ini kapan saja. Penggunaan Layanan yang berkelanjutan setelah perubahan tersebut merupakan penerimaan Anda terhadap Ketentuan baru.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-[15px] font-bold text-slate-500">
                Jika Anda memiliki pertanyaan tentang Ketentuan ini, silakan hubungi kami di <a href="mailto:support@ryz.my.id" className="text-[#0b5cff] hover:underline">support@ryz.my.id</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
