import { useRouter } from 'next/router';
import React from 'react';

const KanjiChoicePage: React.FC = () => {
    const router = useRouter();

    const handleUsageClick = () => {
        router.push('/kanji_sections_frequency');
    };

    const handleMeaningClick = () => {
        router.push('/kanji_sections');
    };

    const handleQuizClick = () => {
        router.push('/kanji_freq_sections');
    };

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-5xl mx-auto mt-6 sm:mt-16">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-12">Choose Your Kanji Learning Path</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
                        <div
                            onClick={handleUsageClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Usage</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Learn kanji by frequency of use in real Japanese</p>
                        </div>
                        <div
                            onClick={handleMeaningClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Meaning</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Learn kanji organized by meaning and radicals</p>
                        </div>
                        <div
                            onClick={handleQuizClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Quiz</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Quiz the meaning and reading of kanji, ordered by frequency</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KanjiChoicePage;
