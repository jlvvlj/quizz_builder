import React, { useState, type ReactElement } from 'react'
import Link from 'next/link'
import type { NextPageWithLayout } from './_app'
import { AuthShell, AuthField, AuthButton, AuthError, AuthSuccess } from '@/components/auth/auth-ui'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [devResetUrl, setDevResetUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send reset link')
            setSuccess(true)
            if (data._dev_resetUrl) setDevResetUrl(data._dev_resetUrl)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Reset your password"
            subtitle="Enter your email and we'll send you a link to reset your password."
            footer={
                <Link href="/login" className="font-medium text-[#FF0054] hover:text-[#e0004a]">
                    Back to sign in
                </Link>
            }
        >
            <AuthError message={error} />

            {success ? (
                <div className="space-y-6">
                    <AuthSuccess>
                        If an account with that email exists, a reset link has been sent.
                        <span className="mt-2 block text-xs text-[#A1A1A1]">
                            (Check the server console for the reset link.)
                        </span>
                    </AuthSuccess>

                    {devResetUrl && (
                        <div className="rounded-lg border border-[#4F4F4F] bg-[#262626] px-4 py-3 text-sm text-[#A1A1A1]">
                            <strong className="text-white">Dev mode — reset link:</strong>
                            <br />
                            <a href={devResetUrl} className="break-all text-[#FF0054] hover:text-[#e0004a]">
                                {devResetUrl}
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <AuthField
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />

                    <AuthButton type="submit" loading={loading}>
                        {loading ? 'Sending…' : 'Send reset link'}
                    </AuthButton>
                </form>
            )}
        </AuthShell>
    )
}

(ForgotPasswordPage as NextPageWithLayout).getLayout = (page: ReactElement) => page
export default ForgotPasswordPage as NextPageWithLayout
