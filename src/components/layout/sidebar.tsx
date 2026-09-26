import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Home,
    BookOpen,
    Layers,
    Tv,
    Youtube,
    Clock,
    Trophy,
    CreditCard,
    HelpCircle,
    Settings,
    LogOut,
} from 'lucide-react';

interface SidebarProps {
    onOpenSettings: () => void;
    onLogout: () => void;
}

interface Item {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    matchPrefix?: string;
    mobile?: boolean;
}

export default function Sidebar({ onOpenSettings, onLogout }: SidebarProps) {
    const router = useRouter();

    const items: Item[] = [
        { label: 'Home', icon: Home, href: '/', matchPrefix: '/', mobile: true },
        { label: 'Learning decks', icon: BookOpen, href: '/home', matchPrefix: '/home', mobile: true },
        { label: 'Settings', icon: Settings, onClick: onOpenSettings, mobile: true },
        { label: 'Logout', icon: LogOut, onClick: onLogout, mobile: true },
    ];

    const isActive = (item: Item) => {
        if (!item.matchPrefix) return false;
        if (item.matchPrefix === '/') return router.pathname === '/';
        return router.pathname.startsWith(item.matchPrefix);
    };

    const renderDesktopItem = (item: Item) => {
        const Icon = item.icon;
        const active = isActive(item);
        const cls =
            'relative flex items-center h-11 px-4 mx-2 rounded-md transition-colors whitespace-nowrap ' +
            (active
                ? 'bg-[#2F2F2F] text-white'
                : 'text-[#A1A1A1] hover:bg-[#262626] hover:text-white');
        const content = (
            <>
                {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#FF0054]" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                </span>
            </>
        );
        if (item.href) {
            return (
                <Link key={item.label} href={item.href} className={cls}>
                    {content}
                </Link>
            );
        }
        return (
            <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cls + ' w-[calc(100%-1rem)] text-left'}
            >
                {content}
            </button>
        );
    };

    const renderMobileItem = (item: Item) => {
        const Icon = item.icon;
        const active = isActive(item);
        const cls =
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 transition-colors ' +
            (active ? 'text-white' : 'text-[#A1A1A1] active:text-white');
        const content = (
            <>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-none truncate max-w-full">{item.label}</span>
                {active && (
                    <span className="absolute top-0 inset-x-6 h-0.5 rounded-b bg-[#FF0054]" />
                )}
            </>
        );
        if (item.href) {
            return (
                <Link key={item.label} href={item.href} className={'relative ' + cls}>
                    {content}
                </Link>
            );
        }
        return (
            <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={'relative ' + cls}
            >
                {content}
            </button>
        );
    };

    const mobileItems = items.filter(i => i.mobile);

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className="group fixed top-0 left-0 z-30 hidden md:flex h-screen w-16 hover:w-56 flex-col bg-[#1F1F1F] text-white border-r border-[#4F4F4F] transition-all duration-200 overflow-hidden"
            >
                <div className="flex h-16 items-center px-4 border-b border-[#4F4F4F]">
                    <span className="text-xl font-bold whitespace-nowrap text-[#FF0054]">Q</span>
                    <span className="ml-2 text-lg font-semibold whitespace-nowrap text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Quizz
                    </span>
                </div>

                <nav className="flex-1 py-4">
                    {items.map(renderDesktopItem)}
                </nav>
            </aside>

            {/* Mobile bottom navigation */}
            <nav
                className="fixed bottom-0 inset-x-0 z-30 flex md:hidden bg-[#1F1F1F] border-t border-[#4F4F4F] text-white pb-[env(safe-area-inset-bottom)]"
            >
                {mobileItems.map(renderMobileItem)}
            </nav>
        </>
    );
}
