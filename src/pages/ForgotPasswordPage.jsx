import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import SEO from '@/components/SEO'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
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
      setSuccessMessage('Password reset instructions have been sent to your email.')
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#273144] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0b5cff]/20">
      <SEO 
        title="Forgot Password | RYZ Shortlink" 
        description="Reset your RYZ Shortlink account password."
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
          <h2 className="text-2xl font-bold text-[#273144]">Reset your password</h2>
          <p className="mt-2 text-[15px] text-[#566b8f]">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-white border border-[#e8ebf2] shadow-sm rounded-[8px] py-8 px-6 sm:px-10">
          {!successMessage ? (
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
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#273144] font-medium mb-6">
                {successMessage}
              </p>
              <Link to="/login" className="bitly-button-primary w-full h-12 text-[16px] inline-flex items-center justify-center">
                Return to log in
              </Link>
            </div>
          )}

          <div className="mt-8 text-center text-sm">
            <Link to="/login" className="text-[#0b5cff] hover:underline font-medium">
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
