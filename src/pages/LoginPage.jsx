import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setServerError(null)
    const result = await signIn(data)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20">
      <SEO 
        title="Log In | RYZ Shortlink" 
        description="Sign in to your RYZ Shortlink account to manage your shortlinks and view analytics."
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
          <h2 className="text-2xl font-bold text-[#273144]">Log in and start sharing</h2>
          <p className="mt-2 text-[15px] text-[#566b8f]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0b5cff] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-white border border-[#e8ebf2] shadow-sm rounded-[8px] py-8 px-6 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
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
              <div className="flex items-center justify-between">
                <label className="block text-[15px] font-bold text-[#273144]">Password</label>
                <a href="#" className="text-sm text-[#0b5cff] hover:underline font-medium">
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bitly-input w-full"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
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
              className="bitly-button-primary w-full h-12 text-[16px]"
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8ebf2]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#566b8f]">or continue with</span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#566b8f]">
            <p>Single Sign-On (SSO) coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
