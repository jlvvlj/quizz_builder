import React from 'react'
import ContinuousTabs, { type TabItem } from './ui/continuous-tabs'

interface TabNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    rightContent?: React.ReactNode;
    hideTabs?: string[];
}

const ALL_TABS: TabItem[] = [
    { id: 'session', label: 'Session' },
    { id: 'all', label: 'All' },
]

export default function TabNavigation({ activeTab, onTabChange, rightContent, hideTabs = [] }: TabNavigationProps) {
    const tabs = ALL_TABS.filter((t) => !hideTabs.includes(t.id))
    return (
        <div className="inline-flex items-center gap-2 flex-shrink-0">
            {tabs.length > 0 && (
                <ContinuousTabs
                    tabs={tabs}
                    activeId={activeTab}
                    onChange={onTabChange}
                    size="sm"
                />
            )}
            {rightContent}
        </div>
    )
}
