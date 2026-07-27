import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import StepsPage from '@/components/StepsPage'

export default function Steps() {
    const router = useRouter();
    const { section } = router.query;

    // Show loading state while router is not ready
    if (!router.isReady) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center">
                <LoadingState text="Loading steps" />
            </div>
        );
    }

    // Redirect to home if no section is provided
    if (!section || typeof section !== 'string' || !section.startsWith('section_')) {
        router.push('/');
        return null;
    }

    const handleCourseSelect = (stepId: number, section: string, step: string) => {
        console.log('Navigating to session preview:', { section, step });
        router.push(`/session_preview?section=${section}&step=${step}`);
    }

    const handleSettingsClick = () => {
        // We'll implement settings later
    }

    return (
        <StepsPage 
            onCourseSelect={handleCourseSelect}
            onSettingsClick={handleSettingsClick}
            currentSection={section}
        />
    )
} 
