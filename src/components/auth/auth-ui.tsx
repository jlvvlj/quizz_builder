import React, { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string
                        callback: (response: { credential: string }) => void
                    }) => void
                    renderButton: (
                        element: HTMLElement,
                        config: { theme: string; size: string; width: number },
                    ) => void
                }
            }
        }
    }
}

// Google sign-in is temporarily hidden until OAuth is configured
// (NEXT_PUBLIC_GOOGLE_CLIENT_ID). Flip to true to re-enable the button and the
// "or" divider on the login and signup screens.
export const GOOGLE_SIGNIN_ENABLED = false

/** Split-screen auth layout: branded panel on the left, form column on the right. */
export function AuthShell({
    title,
    subtitle,
    children,
    footer,
}: {
    title: string
    subtitle?: ReactNode
    children: ReactNode
    footer?: ReactNode
}) {
    return (
        <div className="min-h-screen w-full bg-[#1F1F1F] text-white lg:grid lg:grid-cols-2">
            <AuthBrandPanel />
            <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:min-h-0">
                <div className="mx-auto w-full max-w-sm">
                    {/* Compact brand for mobile, where the side panel is hidden. */}
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <BrandMark className="h-9 w-9 text-base" />
                        <span className="text-lg font-semibold">Quizz</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-[#A1A1A1]">{subtitle}</p>}

                    <div className="mt-8">{children}</div>

                    {footer && <div className="mt-8 text-center text-sm text-[#A1A1A1]">{footer}</div>}
                </div>
            </div>
        </div>
    )
}

function AuthBrandPanel() {
    return (
        <div className="relative hidden overflow-hidden bg-[#171717] lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                    background:
                        'radial-gradient(1200px 600px at 0% 0%, rgba(255,0,84,0.22), transparent 55%), radial-gradient(900px 500px at 100% 100%, rgba(255,0,84,0.12), transparent 50%)',
                }}
            />
            <div className="relative flex items-center gap-3">
                <BrandMark className="h-11 w-11 text-xl" />
                <span className="text-2xl font-bold">Quizz</span>
            </div>

            <div className="relative">
                <p className="text-5xl font-bold leading-tight tracking-tight">学びを</p>
                <p className="text-5xl font-bold leading-tight tracking-tight text-[#FF0054]">深めよう</p>
                <p className="mt-6 max-w-sm text-[#A1A1A1]">
                    Learn in a way that sticks — questions, answers, and review tuned to how you study.
                </p>
            </div>

            <div className="relative text-sm text-[#6F6F6F]">Build knowledge, one session at a time.</div>
        </div>
    )
}

export function BrandMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-xl bg-[#FF0054] font-bold text-white',
                className,
            )}
        >
            Q
        </span>
    )
}

export function AuthField({
    label,
    id,
    hint,
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
    return (
        <div>
            {label && (
                <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#E5E5E5]">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={cn(
                    'h-12 w-full rounded-lg border border-[#4F4F4F] bg-[#262626] px-4 text-sm text-white placeholder:text-[#6F6F6F] transition-colors focus:border-[#FF0054] focus:outline-none focus:ring-1 focus:ring-[#FF0054]',
                    className,
                )}
                {...props}
            />
            {hint && <p className="mt-1.5 text-xs text-[#6F6F6F]">{hint}</p>}
        </div>
    )
}

export function PasswordField({
    label,
    id,
    hint,
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string; hint?: string }) {
    const [show, setShow] = useState(false)
    return (
        <div>
            {label && (
                <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#E5E5E5]">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    className="h-12 w-full rounded-lg border border-[#4F4F4F] bg-[#262626] px-4 pr-11 text-sm text-white placeholder:text-[#6F6F6F] transition-colors focus:border-[#FF0054] focus:outline-none focus:ring-1 focus:ring-[#FF0054]"
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6F6F] transition-colors hover:text-white"
                >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
            {hint && <p className="mt-1.5 text-xs text-[#6F6F6F]">{hint}</p>}
        </div>
    )
}

export function AuthButton({
    children,
    loading,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
    return (
        <button
            className={cn(
                'h-12 w-full rounded-lg bg-[#FF0054] font-medium text-white transition-colors hover:bg-[#e0004a] disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {children}
        </button>
    )
}

export function AuthError({ message }: { message: string }) {
    if (!message) return null
    return (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    )
}

export function AuthSuccess({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{children}</div>
        </div>
    )
}

export function GoogleSignInButton({
    onError,
    onStart,
    redirectTo = '/jalingo',
}: {
    onError: (message: string) => void
    onStart?: () => void
    redirectTo?: string
}) {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async (response: { credential: string }) => {
            try {
                onStart?.()
                const payload = JSON.parse(atob(response.credential.split('.')[1]))
                const res = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        googleId: payload.sub,
                        email: payload.email,
                        name: payload.name,
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Google sign-in failed')
                router.push(redirectTo)
            } catch (err: unknown) {
                onError(err instanceof Error ? err.message : 'Google sign-in failed')
            }
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
            if (!window.google) return
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                callback: handleCallback,
            })
            const buttonDiv = document.getElementById('google-signin-button')
            if (buttonDiv) {
                window.google.accounts.id.renderButton(buttonDiv, {
                    theme: 'outline',
                    size: 'large',
                    width: 320,
                })
            }
        }
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <div id="google-signin-button" className="flex justify-center" />
}

export function AuthDivider({ label = 'or' }: { label?: string }) {
    return (
        <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#4F4F4F]" />
            <span className="px-4 text-xs uppercase tracking-wide text-[#6F6F6F]">{label}</span>
            <div className="flex-1 border-t border-[#4F4F4F]" />
        </div>
    )
}
