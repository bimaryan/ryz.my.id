import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-primary-500/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <SEO 
        title="Log In | RYZ Shortlink" 
        description="Sign in to your RYZ Shortlink account to manage your shortlinks and view analytics."
      />

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent-900/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
              <Link2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              RYZ<span className="font-light text-primary-400">Link</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl py-8 px-4 sm:px-10 shadow-black/50">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label={<span className="text-slate-300">Email address</span>}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20"
            />

            <div>
              <Input
                label={<span className="text-slate-300">Password</span>}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20"
              />
              <div className="mt-2 flex items-center justify-end">
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>

            {(authError || serverError) && (
              <div className="rounded-lg bg-error-500/10 p-4 border border-error-500/20">
                <div className="text-sm text-error-400">
                  {authError || serverError}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 border-none shadow-lg shadow-primary-500/25 transition-all duration-300"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-500 backdrop-blur-xl">Or</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

