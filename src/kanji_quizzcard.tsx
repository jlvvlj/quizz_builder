import { useState } from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import React from "react"
import { fetchKanjiByCharacter } from "@/utils/supabase-client"
import { getAudioUrl } from "@/utils/audioUrl"
import KanjiSheet from "@/components/KanjiSheet"
import { KanjiMnemonic, PrimitiveHintCard, type PrimitiveHint } from "@/components/KanjiMnemonic"

interface QuizzCardProps {
  card: {
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
    word_reading?: string[];
    word_reading_2?: string[];
    word_reading_3?: string[];
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
  };
  onNext: () => void;
  onBack: () => void;
  isFirstCard: boolean;
  compactPrimitives?: boolean;
}

interface SentenceData {
  japanese: string;
  english: string;
  audio: boolean;
  audioPath?: string;
}

function isKanji(char: string): boolean {
  return char.match(/[\u4e00-\u9faf]/) !== null;
}

export default function QuizzCard({ card, compactPrimitives = false }: QuizzCardProps) {
  const [activeTab, setActiveTab] = useState("Vocabulary")
  const [selectedKanji, setSelectedKanji] = useState<QuizzCardProps["card"] | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Add console.log to see the new array data
  console.log('New reading arrays for kanji:', card.question, {
    word_reading: card.word_reading,
    word_reading_2: card.word_reading_2,
    word_reading_3: card.word_reading_3
  });

  // Transform card data into the format expected by the component
  const vocabularyData = [
    {
      kanji: card.used_in_word || "",
      reading: card.word_reading ? card.word_reading.join('・') : "",
      meaning: card.used_in_word_meaning || "",
    },
    card.used_in_word_2 ? {
      kanji: card.used_in_word_2,
      reading: card.word_reading_2 ? card.word_reading_2.join('・') : "",
      meaning: card.used_in_word_meaning_2 || "",
    } : null,
    card.used_in_word_3 ? {
      kanji: card.used_in_word_3,
      reading: card.word_reading_3 ? card.word_reading_3.join('・') : "",
      meaning: card.used_in_word_meaning_3 || "",
    } : null,
  ].filter(Boolean);

  const sentenceData = [
    card.example_sentence_japanese ? {
      japanese: card.example_sentence_japanese,
      english: card.example_sentence_english || "",
      audio: !!card.sentence_audio_path,
      audioPath: card.sentence_audio_path
    } : null,
    card.example_sentence_japanese_2 ? {
      japanese: card.example_sentence_japanese_2,
      english: card.example_sentence_english_2 || "",
      audio: !!card.sentence_audio_path_2,
      audioPath: card.sentence_audio_path_2
    } : null,
    card.example_sentence_japanese_3 ? {
      japanese: card.example_sentence_japanese_3,
      english: card.example_sentence_english_3 || "",
      audio: !!card.sentence_audio_path_3,
      audioPath: card.sentence_audio_path_3
    } : null,
  ].filter(Boolean) as SentenceData[];

  const kanjiData = [
    card.used_in_kanji_kanji ? { kanji: card.used_in_kanji_kanji, meaning: card.used_in_kanji_meaning || "" } : null,
    card.used_in_kanji_kanji_2 ? { kanji: card.used_in_kanji_kanji_2, meaning: card.used_in_kanji_meaning_2 || "" } : null,
    card.used_in_kanji_kanji_3 ? { kanji: card.used_in_kanji_kanji_3, meaning: card.used_in_kanji_meaning_3 || "" } : null,
  ].filter(Boolean);

  const primitiveData = [
    card.composed_of_kanji ? { kanji: card.composed_of_kanji, meaning: card.composed_of_kanji_description || "" } : null,
    card.composed_of_kanji_2 ? { kanji: card.composed_of_kanji_2, meaning: card.composed_of_kanji_description_2 || "" } : null,
    card.composed_of_kanji_3 ? { kanji: card.composed_of_kanji_3, meaning: card.composed_of_kanji_description_3 || "" } : null,
  ].filter((primitive): primitive is PrimitiveHint => !!primitive && !!primitive.meaning);
  const hasMnemonic = !!card.mnemonic?.trim();

  const playAudio = (audioPath: string) => {
    console.log('🎵 Starting playAudio with path:', audioPath);
    
    // Create audio context for phrase
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🎵 Created AudioContext:', audioContext.state);

    // Fetch and decode phrase audio data
    const audioUrl = getAudioUrl(audioPath);
    if (!audioUrl) {
      console.error('🎵 No audio URL resolved for path:', audioPath);
      return;
    }
    console.log('🎵 Fetching audio from:', audioUrl);
    fetch(audioUrl)
      .then(async response => {
        console.log('🎵 Fetch response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🎵 Error response body:', errorText);
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.arrayBuffer();
      })
      .then(async buffer => {
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1;
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();
      })
      .catch(error => {
        console.error('🎵 Error playing audio:', error);
      });
  };

  const handleKanjiClick = async (kanji: string) => {
    const { kanji: kanjiData } = await fetchKanjiByCharacter(kanji);
    if (kanjiData) {
      // Transform the kanji data into the format expected by QuizzCard
      const transformedKanji = {
        question: kanjiData.japanese_word,
        correctAnswer: kanjiData.english,
        mnemonic: kanjiData.mnemonic,
        composed_of_kanji: kanjiData.composed_of_kanji_1,
        composed_of_kanji_description: kanjiData.composed_of_kanji_description_1,
        composed_of_kanji_2: kanjiData.composed_of_kanji_2,
        composed_of_kanji_description_2: kanjiData.composed_of_kanji_description_2,
        composed_of_kanji_3: kanjiData.composed_of_kanji_3,
        composed_of_kanji_description_3: kanjiData.composed_of_kanji_description_3,
        used_in_kanji_kanji: kanjiData.used_in_kanji_kanji,
        used_in_kanji_meaning: kanjiData.used_in_kanji_meaning,
        used_in_kanji_kanji_2: kanjiData.used_in_kanji_kanji_2,
        used_in_kanji_meaning_2: kanjiData.used_in_kanji_meaning_2,
        used_in_kanji_kanji_3: kanjiData.used_in_kanji_kanji_3,
        used_in_kanji_meaning_3: kanjiData.used_in_kanji_meaning_3,
        used_in_word: kanjiData.used_in_word,
        used_in_word_reading: kanjiData.used_in_word_reading,
        used_in_word_meaning: kanjiData.used_in_word_meaning,
        used_in_word_2: kanjiData.used_in_word_2,
        used_in_word_reading_2: kanjiData.used_in_word_reading_2,
        used_in_word_meaning_2: kanjiData.used_in_word_meaning_2,
        used_in_word_3: kanjiData.used_in_word_3,
        used_in_word_reading_3: kanjiData.used_in_word_reading_3,
        used_in_word_meaning_3: kanjiData.used_in_word_meaning_3,
        example_sentence_japanese: kanjiData.example_sentence_japanese,
        example_sentence_english: kanjiData.example_sentence_english,
        sentence_audio_path: kanjiData.sentence_audio_path,
        example_sentence_japanese_2: kanjiData.example_sentence_japanese_2,
        example_sentence_english_2: kanjiData.example_sentence_english_2,
        sentence_audio_path_2: kanjiData.sentence_audio_path_2,
        example_sentence_japanese_3: kanjiData.example_sentence_japanese_3,
        example_sentence_english_3: kanjiData.example_sentence_english_3,
        sentence_audio_path_3: kanjiData.sentence_audio_path_3,
        japanese_reading_1: kanjiData.japanese_reading_1,
        japanese_reading_2: kanjiData.japanese_reading_2,
        japanese_reading_3: kanjiData.japanese_reading_3,
      };
      setSelectedKanji(transformedKanji);
      setIsSheetOpen(true);
    }
  };

  return (
    <div className="h-full bg-[#181818] text-white px-3 sm:px-8">
      <div className="max-w-[1440px] mx-auto relative">
        {/* Scrollable content area */}
        <div className="h-full overflow-y-auto py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mb-6 sm:mb-8 items-center lg:items-stretch">
            {/* Composed of section */}
            <div className={`${compactPrimitives ? 'shrink-0 lg:w-28' : 'shrink-0 lg:w-48'} flex flex-row lg:flex-col flex-wrap justify-center gap-3 order-2 lg:order-1`}>
              <div className="contents lg:block lg:space-y-3">
                {primitiveData.map((primitive) => (
                  <button
                    key={`${primitive.kanji}-${primitive.meaning}`}
                    onClick={() => handleKanjiClick(primitive.kanji)}
                    className="shrink-0 lg:w-full"
                  >
                    <PrimitiveHintCard primitive={primitive} compact={compactPrimitives} />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Kanji Card */}
            <div className="flex-shrink-0 flex items-center order-1 lg:order-2 w-full lg:w-auto justify-center">
              <Card className="bg-[#262626] border-[#4F4F4F] border h-64 w-64 sm:h-80 sm:w-80 lg:h-120 lg:w-120 flex flex-col items-center rounded-2xl">
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center pt-4">
                  <div className="flex gap-3 sm:gap-6 lg:gap-8 flex-wrap justify-center">
                    {card.japanese_reading_1 && (
                      <span className="text-white text-lg sm:text-2xl lg:text-3xl">{card.japanese_reading_1}</span>
                    )}
                    {card.japanese_reading_2 && (
                      <span className="text-white text-lg sm:text-2xl lg:text-3xl">{card.japanese_reading_2}</span>
                    )}
                    {card.japanese_reading_3 && (
                      <span className="text-white text-lg sm:text-2xl lg:text-3xl">{card.japanese_reading_3}</span>
                    )}
                  </div>
                  <div className={`${hasMnemonic ? 'text-[120px] sm:text-[170px] lg:text-[280px]' : 'text-[160px] sm:text-[220px] lg:text-[380px]'} font-bold text-white leading-none`}>
                    {card.question}
                  </div>
                </div>
                <div className="text-white text-base sm:text-xl lg:text-2xl text-center px-4 pb-4 w-full truncate">
                  {card.correctAnswer}
                </div>
                {hasMnemonic && (
                  <div className="border-t border-[#4F4F4F] w-full px-3 sm:px-4 py-2 sm:py-3 max-h-24 sm:max-h-32 overflow-y-auto">
                    <div className="text-white text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-line">
                      <KanjiMnemonic
                        mnemonic={card.mnemonic || ''}
                        english={card.correctAnswer}
                        primitives={primitiveData}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Used in Section - Right Column */}
            <div className="flex-1 w-full order-3">
              <h3 className="text-[#A1A1A1] text-sm mb-4">Used in</h3>
              <div className="flex gap-1 bg-[#262626] border border-[#4F4F4F] p-1 rounded-xl w-fit mb-6">
                {["Vocabulary", "Sentences", "Kanji"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-sm transition-colors ${
                      activeTab === tab
                        ? "bg-[#2F2F2F] border border-[#4F4F4F] text-white"
                        : "text-[#A1A1A1] hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "Vocabulary" && (
                <div className="flex flex-wrap gap-4 sm:gap-8">
                  {vocabularyData.map((item, index) => item && (
                    <div key={index}>
                      <div className="flex items-end mb-1">
                        {item.kanji.split('').map((char, charIndex) => {
                          if (char === card.question) {
                            const currentReading = item.reading.split('・')[charIndex];
                            return (
                              <div key={charIndex} className="inline-flex flex-col items-center">
                                <span className="text-[16px] text-[#A1A1A1] leading-none mb-1">
                                  {currentReading}
                                </span>
                                <span className="text-[30px]">{char}</span>
                              </div>
                            );
                          }
                          return (
                            <span key={charIndex} className="text-[30px]">
                              {char}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-white text-[24px]">{item.meaning}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Sentences" && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
                  {sentenceData.map((item, index) => item && (
                    <div key={index} className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-white text-[30px]">
                          {item.japanese.split(card.question).map((part, i, arr) => (
                            <React.Fragment key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span style={{ backgroundColor: '#DA2877', color: 'white', padding: '4px', borderRadius: '4px' }}>
                                  {card.question}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                        {item.audio && item.audioPath && (
                          <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={() => playAudio(item.audioPath!)}>
                            <Volume2 className="w-6 h-6 text-[#A1A1A1]" />
                          </Button>
                        )}
                      </div>
                      <div className="text-[#A1A1A1] text-[24px]">{item.english}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Kanji" && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
                  {kanjiData.map((item, index) => item && (
                    <div key={index} className="flex items-center gap-6">
                      <span className="text-[30px]">{item.kanji}</span>
                      <span className="text-white text-[24px]">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Fixed height */}
        
      </div>

      {/* Kanji Sheet */}
      <KanjiSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        kanji={selectedKanji}
      />
    </div>
  )
}
