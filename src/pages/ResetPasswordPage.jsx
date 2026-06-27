import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'
import { supabase } from '@/lib/supabase'

const resetPasswordSchema = z.object({
 password: z.string()
 .min(8, 'Kata sandi minimal 8 karakter')
 .regex(/[A-Z]/, 'Harus mengandung huruf besar')
 .regex(/[a-z]/, 'Harus mengandung huruf kecil')
 .regex(/[0-9]/, 'Harus mengandung angka')
 .regex(/[^A-Za-z0-9]/, 'Harus mengandung karakter khusus'),
 confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
 message:"Kata sandi tidak cocok",
 path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
 const navigate = useNavigate()
 const { updatePassword, isLoading, error: authError } = useAuth()
 const [serverError, setServerError] = useState(null)
 const [isSessionValid, setIsSessionValid] = useState(true)
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)

 // Verify that the user arrived here with a valid recovery session
 useEffect(() => {
 supabase.auth.getSession().then(({ data: { session } }) => {
 if (!session) {
 setIsSessionValid(false)
 }
 })

 const { data: authListener } = supabase.auth.onAuthStateChange(
 async (event, session) => {
 if (event =="PASSWORD_RECOVERY") {
 setIsSessionValid(true)
 }
 }
 )

 return () => {
 authListener.subscription.unsubscribe()
 }
 }, [])

 const {
 register,
 handleSubmit,
 formState: { errors },
 } = useForm({
 resolver: zodResolver(resetPasswordSchema),
 })

 const onSubmit = async (data) => {
 setServerError(null)
 const result = await updatePassword(data.password)
 
 if (result.success) {
 navigate('/dashboard')
 } else {
 setServerError(result.error)
 }
 }

 if (!isSessionValid) {
 return (
 <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20 relative overflow-hidden">
 {/* Decorative bg */}
 <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob pointer-events-none"></div>
 <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>

 <div className="w-full max-w-[440px] text-center relative z-10 animate-fade-in-up">
 <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-[32px] py-8 px-6 sm:px-10">
 <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-4">Tautan Tidak Valid atau Kedaluwarsa</h2>
 <p className="text-slate-500 font-medium mb-8 leading-relaxed">
 Tautan untuk mengatur ulang kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.
 </p>
 <Link to="/forgot-password" className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center">
 Minta Tautan Baru
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20 relative overflow-hidden">
 <SEO 
 title="Atur Kata Sandi Baru | RYZ Shortlink" 
 description="Atur kata sandi baru untuk akun RYZ Shortlink Anda."
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
 <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Atur kata sandi baru</h2>
 <p className="mt-2 text-[15px] font-medium text-slate-500">
 Silakan masukkan kata sandi baru Anda di bawah ini.
 </p>
 </div>

 <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-[32px] py-8 px-6 sm:px-10">
 <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
 
 <div className="space-y-2">
 <label className="block text-[15px] font-bold text-slate-700">Kata Sandi Baru</label>
 <div className="relative">
 <input
 type={showPassword ?"text" :"password"}
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

 <div className="space-y-2">
 <label className="block text-[15px] font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
 <div className="relative">
 <input
 type={showConfirmPassword ?"text" :"password"}
 placeholder="••••••••"
 {...register('confirmPassword')}
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b5cff] focus:bg-white focus:ring-4 focus:ring-[#0b5cff]/10 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-800 transition-all outline-none"
 />
 <button 
 type="button" 
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b5cff] focus:outline-none transition-colors"
 >
 {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>
 {errors.confirmPassword && <p className="text-sm font-medium text-red-500 mt-1">{errors.confirmPassword.message}</p>}
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
 className="w-full bg-gradient-to-r from-[#0b5cff] to-indigo-600 hover:from-[#094acc] hover:to-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 mt-2"
 >
 {isLoading ? 'Memperbarui...' : 'Perbarui kata sandi'}
 </button>
 </form>
 </div>
 </div>
 </div>
 )
}
