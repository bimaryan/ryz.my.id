import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/hooks/useAuth'
import { Turnstile } from '@marsidev/react-turnstile'
import SEO from '@/components/SEO'

const loginSchema = z.object({
  email: z.string().email('Alamat email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaError, setCaptchaError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    if (!captchaToken) {
      setCaptchaError('Mohon selesaikan verifikasi keamanan (CAPTCHA).')
      return
    }
    setCaptchaError('')
    
    setServerError(null)
    const result = await signIn({ ...data, captchaToken })
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      if (result.error?.includes('rate limit')) {
        setServerError('Terlalu banyak percobaan masuk. Silakan coba lagi nanti.')
      } else {
        setServerError(result.error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20 relative overflow-hidden">
      <SEO 
        title="Masuk | RYZ Shortlink" 
        description="Masuk ke akun RYZ Shortlink Anda untuk mengelola tautan dan melihat analitik."
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
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Masuk dan mulai berbagi</h2>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            Belum punya akun?{' '}
            <Link to="/signup" className="text-[#0b5cff] hover:text-[#094acc] hover:underline font-bold transition-colors">
              Daftar
            </Link>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-[32px] py-8 px-6 sm:px-10">
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 hover:border-[#0b5cff] rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm mb-6"
            type="button"
          >
            <FcGoogle className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[13px] uppercase tracking-wider font-bold">
              <span className="px-3 bg-white text-slate-400">Atau masuk dengan email</span>
            </div>
          </div>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[15px] font-bold text-slate-700">Kata Sandi</label>
                <Link to="/forgot-password" className="text-sm text-[#0b5cff] hover:text-[#094acc] hover:underline font-bold transition-colors">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-800 transition-all outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b5cff] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {(authError || serverError) && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="text-sm text-red-600 font-bold">
                  {authError || serverError}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center mt-2">
              <Turnstile 
                siteKey="0x4AAAAAADodRb51u3jJ_MQg" 
                onSuccess={(token) => {
                  setCaptchaToken(token)
                  setCaptchaError('')
                }} 
                options={{ theme: 'light' }}
              />
              {captchaError && <p className="text-sm font-medium text-red-500 mt-2">{captchaError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 mt-2"
            >
              {isLoading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
