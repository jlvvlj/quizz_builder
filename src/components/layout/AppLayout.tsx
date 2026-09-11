import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './sidebar';
import SettingsModal from '@/pages/settings_modal';
import { SettingsContext } from './SettingsContext';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter();
    const [showSettings, setShowSettings] = useState(false);
    const listenersRef = useRef(new Set<() => void>());

    const openSettings = useCallback(() => setShowSettings(true), []);
    const closeSettings = useCallback(() => setShowSettings(false), []);

    const onSettingsSaved = useCallback((handler: () => void) => {
        listenersRef.current.add(handler);
        return () => {
            listenersRef.current.delete(handler);
        };
    }, []);

    const handleSettingsChange = useCallback(() => {
        listenersRef.current.forEach(fn => {
            try {
                fn();
            } catch (err) {
                console.error('settings listener failed:', err);
            }
        });
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const ctxValue = useMemo(
        () => ({ isSettingsOpen: showSettings, openSettings, closeSettings, onSettingsSaved }),
        [showSettings, openSettings, closeSettings, onSettingsSaved],
    );

    return (
        <SettingsContext.Provider value={ctxValue}>
            <Sidebar onOpenSettings={openSettings} onLogout={handleLogout} />
            <div className="md:pl-16 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
            {showSettings && (
                <SettingsModal
                    onClose={closeSettings}
                    onSettingsChange={handleSettingsChange}
                />
            )}
        </SettingsContext.Provider>
    );
}
