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

function LoginPage() {
    const router = useRouter()
    const redirectTo = typeof router.query.redirect === 'string' ? router.query.redirect : '/jalingo'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Login failed')
            router.push(redirectTo)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue your Japanese practice."
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-[#FF0054] hover:text-[#e0004a]">
                        Sign up
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

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium text-[#E5E5E5]">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-sm text-[#FF0054] hover:text-[#e0004a]">
                            Forgot password?
                        </Link>
                    </div>
                    <PasswordField
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        aria-label="Password"
                    />
                </div>

                <AuthButton type="submit" loading={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </AuthButton>
            </form>

            {GOOGLE_SIGNIN_ENABLED && (
                <>
                    <AuthDivider />
                    <GoogleSignInButton
                        onError={setError}
                        onStart={() => setError('')}
                        redirectTo={redirectTo}
                    />
                </>
            )}
        </AuthShell>
    )
}

(LoginPage as NextPageWithLayout).getLayout = (page: ReactElement) => page
export default LoginPage as NextPageWithLayout
