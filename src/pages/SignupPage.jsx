import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Check } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'
import SEO from '@/components/SEO'

const DISPOSABLE_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'yopmail.com', 'throwawaymail.com', 'getnada.com', 'tempmail.com', 'trashmail.com', 'sharklasers.com', 'dispostable.com', 'tempmail.net'
];

const signupSchema = z.object({
  full_name: z.string().min(2, 'Nama harus memiliki setidaknya 2 karakter'),
  username: z.string().min(3, 'Username harus memiliki setidaknya 3 karakter'),
  email: z.string().email('Alamat email tidak valid').refine(email => {
    const domain = email.split('@')[1];
    return !DISPOSABLE_DOMAINS.includes(domain?.toLowerCase());
  }, { message: "Email sekali pakai atau sementara tidak diperbolehkan." }),
  password: z.string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[^A-Za-z0-9]/, 'Harus mengandung karakter khusus'),
  _bot_catcher: z.string().optional() // Honeypot field
})

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Cloudflare Turnstile state
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaError, setCaptchaError] = useState('')
  const turnstileRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data) => {
    if (!captchaToken) {
      setCaptchaError('Mohon selesaikan verifikasi keamanan (CAPTCHA).')
      return
    }
    setCaptchaError('')

    // Honeypot check: If the hidden field is filled, it's a bot.
    if (data._bot_catcher) {
      console.warn('Bot detected during signup.')
      // Simulate success to trick the bot
      navigate('/login')
      return
    }

    setServerError(null)
    const result = await signUp({ ...data, captchaToken })
    
    if (result.success) {
      // Forcefully sign out in case Supabase auto-creates a session
      await supabase.auth.signOut()
      setSuccessMessage('Pendaftaran berhasil! Silakan cek email Anda untuk memverifikasi akun.')
    } else {
      // Reset captcha when there is an error
      turnstileRef.current?.reset()
      setCaptchaToken(null)

      if (result.error?.includes('rate limit')) {
        setServerError('Terlalu banyak percobaan. Silakan coba lagi nanti.')
      } else {
        setServerError(result.error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20 relative overflow-hidden">
      <SEO 
        title="Daftar | RYZ Shortlink" 
        description="Buat akun RYZ Shortlink gratis Anda hari ini dan mulai optimalkan tautan Anda."
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
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Buat akun gratis Anda</h2>
          <p className="mt-2 text-[15px] font-medium text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#0b5cff] hover:text-[#094acc] hover:underline font-bold transition-colors">
              Masuk
            </Link>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-[32px] py-8 px-6 sm:px-10">
          
          {successMessage ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 border border-green-100 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Periksa Email Anda</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">{successMessage}</p>
              <Link to="/login" className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center hover:-translate-y-0.5">
                Kembali ke halaman Masuk
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 hover:border-[#0b5cff] rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm mb-6"
                type="button"
              >
                <FcGoogle className="w-5 h-5" />
                Daftar dengan Google
              </button>
          
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[13px] uppercase tracking-wider font-bold">
                  <span className="px-3 bg-white text-slate-400">Atau daftar dengan email</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="space-y-2">
                  <label className="block text-[15px] font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    {...register('full_name')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 transition-all outline-none"
                  />
                  {errors.full_name && <p className="text-sm font-medium text-red-500 mt-1">{errors.full_name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[15px] font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    placeholder="budisantoso"
                    {...register('username')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 transition-all outline-none"
                  />
                  {errors.username && <p className="text-sm font-medium text-red-500 mt-1">{errors.username.message}</p>}
                </div>

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
                  <label className="block text-[15px] font-bold text-slate-700">Kata Sandi</label>
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

                {/* Honeypot field - hidden from humans, visible to bots reading HTML */}
                <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                  <input type="text" tabIndex="-1" autoComplete="off" {...register('_bot_catcher')} />
                </div>

                <div className="flex flex-col items-center mt-2">
                  <Turnstile 
                    ref={turnstileRef}
                    siteKey="0x4AAAAAADodRb51u3jJ_MQg" 
                    onSuccess={(token) => {
                      setCaptchaToken(token)
                      setCaptchaError('')
                    }} 
                    options={{ theme: 'light' }}
                  />
                  {captchaError && <p className="text-sm font-medium text-red-500 mt-2">{captchaError}</p>}
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
                  {isLoading ? 'Membuat akun...' : 'Daftar'}
                </button>
              </form>

              <p className="mt-8 text-center text-[13px] font-medium text-slate-500 leading-relaxed">
                Dengan membuat akun, Anda menyetujui{' '}
                <Link to="/terms" className="text-[#0b5cff] hover:underline font-bold">Syarat & Ketentuan</Link>{' '}
                serta{' '}
                <Link to="/privacy" className="text-[#0b5cff] hover:underline font-bold">Kebijakan Privasi</Link> RYZLink.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
