import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'

const forgotPasswordSchema = z.object({
  email: z.string().email('Alamat email tidak valid'),
})

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setServerError(null)
    setSuccessMessage(null)
    const result = await resetPassword(data.email)
    
    if (result.success) {
      setSuccessMessage('Instruksi untuk mengatur ulang kata sandi telah dikirim ke email Anda.')
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20 relative overflow-hidden">
      <SEO 
        title="Lupa Kata Sandi | RYZ Shortlink" 
        description="Atur ulang kata sandi akun RYZ Shortlink Anda."
      />

      {/* Decorative bg */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b5cff] to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="font-extrabold text-2xl font-sans tracking-wide">R</span>
            </div>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">
              RYZ<span className="text-[#0b5cff]">Link</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Atur ulang kata sandi</h2>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-[32px] py-8 px-6 sm:px-10">
          {!successMessage ? (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="space-y-2">
                <label className="block text-[15px] font-bold text-slate-700">Alamat Email</label>
                <input
                  type="email"
                  placeholder="anda@contoh.com"
                  {...register('email')}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 transition-all outline-none"
                />
                {errors.email && <p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {(authError || serverError) && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-600 font-bold">
                    {authError || serverError}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 mt-2"
              >
                {isLoading ? 'Mengirim...' : 'Kirim tautan'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 border border-green-100 shadow-sm mb-6">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-800 font-bold mb-8 text-lg">
                {successMessage}
              </p>
              <Link to="/login" className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center hover:-translate-y-0.5">
                Kembali ke halaman masuk
              </Link>
            </div>
          )}

          {!successMessage && (
            <div className="mt-8 text-center text-[15px]">
              <Link to="/login" className="text-[#0b5cff] hover:text-[#094acc] hover:underline font-bold transition-colors">
                Kembali ke halaman masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
