import React, { useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { NextPageWithLayout } from './_app'
import { AuthShell, PasswordField, AuthButton, AuthError, AuthSuccess } from '@/components/auth/auth-ui'

function ResetPasswordPage() {
    const router = useRouter()
    const token = typeof router.query.token === 'string' ? router.query.token : ''

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (!token) {
            setError('Invalid reset link')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to reset password')
            setSuccess(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (!router.isReady) {
        return <AuthShell title="Loading…">{null}</AuthShell>
    }

    if (!token) {
        return (
            <AuthShell
                title="Invalid link"
                subtitle="This password reset link is invalid or has expired."
            >
                <Link
                    href="/forgot-password"
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-[#FF0054] font-medium text-white transition-colors hover:bg-[#e0004a]"
                >
                    Request a new link
                </Link>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            title="Set a new password"
            subtitle="Enter your new password below."
            footer={
                <Link href="/login" className="font-medium text-[#FF0054] hover:text-[#e0004a]">
                    Back to sign in
                </Link>
            }
        >
            <AuthError message={error} />

            {success ? (
                <div className="space-y-6">
                    <AuthSuccess>Your password has been reset successfully.</AuthSuccess>
                    <Link
                        href="/login"
                        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#FF0054] font-medium text-white transition-colors hover:bg-[#e0004a]"
                    >
                        Go to sign in
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordField
                        label="New password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        hint="At least 6 characters"
                    />

                    <PasswordField
                        label="Confirm password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />

                    <AuthButton type="submit" loading={loading}>
                        {loading ? 'Resetting…' : 'Reset password'}
                    </AuthButton>
                </form>
            )}
        </AuthShell>
    )
}

(ResetPasswordPage as NextPageWithLayout).getLayout = (page: ReactElement) => page
export default ResetPasswordPage as NextPageWithLayout
