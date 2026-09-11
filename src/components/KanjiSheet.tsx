import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import QuizzCard from '@/kanji_quizzcard'

interface KanjiData {
    question: string;
    correctAnswer: string;
    mnemonic?: string;
    composed_of_kanji?: string;
    composed_of_kanji_description?: string;
    composed_of_kanji_2?: string;
    composed_of_kanji_description_2?: string;
    composed_of_kanji_3?: string;
    composed_of_kanji_description_3?: string;
    used_in_kanji_kanji?: string;
    used_in_kanji_meaning?: string;
    used_in_kanji_kanji_2?: string;
    used_in_kanji_meaning_2?: string;
    used_in_kanji_kanji_3?: string;
    used_in_kanji_meaning_3?: string;
    used_in_word?: string;
    used_in_word_reading?: string;
    used_in_word_meaning?: string;
    used_in_word_2?: string;
    used_in_word_reading_2?: string;
    used_in_word_meaning_2?: string;
    used_in_word_3?: string;
    used_in_word_reading_3?: string;
    used_in_word_meaning_3?: string;
    example_sentence_japanese?: string;
    example_sentence_english?: string;
    sentence_audio_path?: string;
    example_sentence_japanese_2?: string;
    example_sentence_english_2?: string;
    sentence_audio_path_2?: string;
    example_sentence_japanese_3?: string;
    example_sentence_english_3?: string;
    sentence_audio_path_3?: string;
    japanese_reading_1?: string;
    japanese_reading_2?: string;
    japanese_reading_3?: string;
}

interface KanjiSheetProps {
    isOpen: boolean;
    onClose: () => void;
    kanji: any | null;
}

export default function KanjiSheet({ isOpen, onClose, kanji }: KanjiSheetProps) {
    if (!kanji) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent 
                side="right" 
                className="w-2/3 border-l border-[#4F4F4F] p-0 overflow-y-auto"
            >
                <div className="h-full">
                   
                    <QuizzCard 
                        card={kanji} 
                        onNext={() => {}} 
                        onBack={() => {}} 
                        isFirstCard={true}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
} 