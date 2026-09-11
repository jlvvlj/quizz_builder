"use client"

import React, { useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { NextPageWithLayout } from './_app'
import {
    AuthShell,
    AuthField,
    PasswordField,
    AuthButton,
    AuthError,
    AuthDivider,
    GoogleSignInButton,
    GOOGLE_SIGNIN_ENABLED,
} from '@/components/auth/auth-ui'

function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
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

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Signup failed')
            router.push('/jalingo')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Start learning Japanese in minutes."
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-[#FF0054] hover:text-[#e0004a]">
                        Sign in
                    </Link>
                </>
            }
        >
            <AuthError message={error} />

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

                <PasswordField
                    label="Password"
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
                    {loading ? 'Creating account…' : 'Create account'}
                </AuthButton>
            </form>

            {GOOGLE_SIGNIN_ENABLED && (
                <>
                    <AuthDivider />
                    <GoogleSignInButton onError={setError} onStart={() => setError('')} />
                </>
            )}
        </AuthShell>
    )
}

(SignupPage as NextPageWithLayout).getLayout = (page: ReactElement) => page
export default SignupPage as NextPageWithLayout
