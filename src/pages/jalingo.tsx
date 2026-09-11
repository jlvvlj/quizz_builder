import { useRouter } from 'next/router';
import React from 'react';

const JalingoPage: React.FC = () => {
    const router = useRouter();

    const handleWordsCardClick = () => {
        router.push('/home?all=1');
    };

    const handleKanjiCardClick = () => {
        router.push('/kanji_choice');
    };

    const handleAnimeCardClick = () => {
        router.push('/anime');
    };

    const handleHomophoneCardClick = () => {
        router.push('/homophone_quiz');
    };

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-5xl mx-auto mt-6 sm:mt-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        <div
                            onClick={handleWordsCardClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Words</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Click to explore Japanese words</p>
                        </div>
                        <div
                            onClick={handleKanjiCardClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Kanji</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Click to explore Japanese kanji</p>
                        </div>
                        <div
                            onClick={handleAnimeCardClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Anime</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Click to learn vocabulary from anime</p>
                        </div>
                        <div
                            onClick={handleHomophoneCardClick}
                            className="md:aspect-square bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-6 text-white">Homophones</h2>
                            <p className="text-[#A1A1A1] text-base sm:text-lg text-center">Click to drill same-sound words like 橋 / 箸 / 端</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JalingoPage;
