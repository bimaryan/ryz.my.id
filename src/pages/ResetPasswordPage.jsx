import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'
import { supabase } from '@/lib/supabase'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState(null)
  const [isSessionValid, setIsSessionValid] = useState(true)

  // Verify that the user arrived here with a valid recovery session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsSessionValid(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event == "PASSWORD_RECOVERY") {
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
      <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20">
        <div className="w-full max-w-[440px] text-center">
          <div className="bg-white border border-[#e8ebf2] shadow-sm rounded-[8px] py-8 px-6 sm:px-10">
            <h2 className="text-2xl font-bold text-[#273144] mb-4">Invalid or Expired Link</h2>
            <p className="text-[#566b8f] mb-6">
              The password reset link you clicked is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="bitly-button-primary w-full h-12 text-[16px] inline-flex items-center justify-center">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20">
      <SEO 
        title="Set New Password | RYZ Shortlink" 
        description="Set a new password for your RYZ Shortlink account."
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
          <h2 className="text-2xl font-bold text-[#273144]">Set new password</h2>
          <p className="mt-2 text-[15px] text-[#566b8f]">
            Please enter your new password below.
          </p>
        </div>

        <div className="bg-white border border-[#e8ebf2] shadow-sm rounded-[8px] py-8 px-6 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bitly-input w-full"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-[#273144]">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="bitly-input w-full"
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
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
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
