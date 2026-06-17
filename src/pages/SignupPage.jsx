import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  _bot_catcher: z.string().optional() // Honeypot field
})

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data) => {
    // Honeypot check: If the hidden field is filled, it's a bot.
    if (data._bot_catcher) {
      console.warn('Bot detected during signup.')
      // Simulate success to trick the bot
      navigate('/login')
      return
    }

    setServerError(null)
    const result = await signUp(data)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      if (result.error?.includes('rate limit')) {
        setServerError('Too many attempts. Please try again later.')
      } else {
        setServerError(result.error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20">
      <SEO 
        title="Sign Up | RYZ Shortlink" 
        description="Create your free RYZ Shortlink account today and start optimizing your links."
      />

      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0b5cff] text-white">
              <span className="font-extrabold text-2xl font-sans tracking-wide">R</span>
            </div>
            <span className="text-3xl font-bold text-[#273144] tracking-tight">
              RYZ<span className="text-[#0b5cff]">Link</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-[#273144]">Create your free account</h2>
          <p className="mt-2 text-[15px] text-[#566b8f]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0b5cff] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>

        <div className="bg-white border border-[#e8ebf2] shadow-sm rounded-[8px] py-8 px-6 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('full_name')}
                className="bitly-input w-full"
              />
              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                {...register('username')}
                className="bitly-input w-full"
              />
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="bitly-input w-full"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password')}
                  className="bitly-input w-full pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Honeypot field - hidden from humans, visible to bots reading HTML */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <input type="text" tabIndex="-1" autoComplete="off" {...register('_bot_catcher')} />
            </div>

            {(authError || serverError) && (
              <div className="rounded-[4px] bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-600 font-medium">
                  {authError || serverError}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bitly-button-primary w-full h-12 text-[16px] mt-2"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#566b8f]">
            By creating an account, you agree to RYZLink's{' '}
            <a href="#" className="text-[#0b5cff] hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#0b5cff] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
