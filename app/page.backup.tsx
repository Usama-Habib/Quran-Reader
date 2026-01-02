"use client";
import React, { useState, useEffect } from "react";
import { surahData } from "../src/data/surahData";
import AudioPlayer from "../src/components/AudioPlayer";
import EnhancedAudioPlayer from "../src/components/EnhancedAudioPlayer";
import { getAyahAudioUrl } from "../src/utils/getAyahAudioUrl";
import SurahList from "../src/components/SurahList";
import SettingsPanel, { ReaderSettings } from "../src/components/SettingsPanel";
import { BookmarkProvider, useBookmarks } from "../src/context/BookmarkContext";

const reciters = [
  { id: 1, name: "Mishary Rashid Al Afasy" },
  { id: 2, name: "Abu Bakr Al Shatri" },
  { id: 3, name: "Nasser Al Qatami" },
  { id: 4, name: "Yasser Al Dosari" },
  { id: 5, name: "Hani Ar Rifai" },
];

const BISMILLAH = {
  arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  en_translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  ur_translation: "شروع الله کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔",
};

const PAGE_SIZE = 14;

const SurahReaderContent: React.FC = () => {
  const [recitingSurah, setRecitingSurah] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState<number | null>(null);
  const [selectedSurahIdx, setSelectedSurahIdx] = useState(0);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState<number>(1);
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [showSurahList, setShowSurahList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [selectedAyahForTranslation, setSelectedAyahForTranslation] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  
  const { addBookmark, removeBookmark, isBookmarked, toggleFavorite, isFavorite, setLastRead } =
    useBookmarks();

  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: "medium",
    darkMode: false,
    showTranslation: true,
    translationLanguage: "both",
    showTransliteration: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("quran-reader-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    
    const savedVolume = localStorage.getItem("quran-reader-volume");
    if (savedVolume) {
      try {
        setVolume(parseFloat(savedVolume));
      } catch (e) {
        console.error("Failed to parse volume", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-reader-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("quran-reader-volume", volume.toString());
  }, [volume]);

  const surah = surahData.surahs[selectedSurahIdx];
  const ayahs = surah.surah_number === 1 ? surah.verses.slice(1) : surah.verses;
  const showBismillah = surah.surah_number !== 9;
  const totalPages = Math.ceil(ayahs.length / PAGE_SIZE);
  const pagedAyahs = ayahs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const startReciteSurah = () => {
    setRecitingSurah(true);
    setCurrentAyahIdx(0);
    setPlayingAyah(ayahs[0].verse_number);
    setPage(0);
    setShowAudioControls(true);
  };

  const handleAyahEnd = () => {
    if (recitingSurah && currentAyahIdx !== null) {
      if (currentAyahIdx < ayahs.length - 1) {
        const nextIdx = currentAyahIdx + 1;
        setCurrentAyahIdx(nextIdx);
        setPlayingAyah(ayahs[nextIdx].verse_number);
        setLastRead(surah.surah_number, ayahs[nextIdx].verse_number);
        if (Math.floor(nextIdx / PAGE_SIZE) !== page) {
          setPage(Math.floor(nextIdx / PAGE_SIZE));
        }
      } else {
        setRecitingSurah(false);
        setCurrentAyahIdx(null);
        setPlayingAyah(null);
        setShowAudioControls(false);
      }
    } else {
      setPlayingAyah(null);
      setShowAudioControls(false);
    }
  };

  const handleAyahClick = (verse_number: number, idx: number) => {
    setRecitingSurah(false);
    setCurrentAyahIdx(null);
    setPlayingAyah(verse_number);
    setShowAudioControls(true);
    setLastRead(surah.surah_number, verse_number);
    if (Math.floor(idx / PAGE_SIZE) !== page) {
      setPage(Math.floor(idx / PAGE_SIZE));
    }
  };

  useEffect(() => {
    setPage(0);
  }, [selectedSurahIdx]);

  const handleSelectSurah = (surahNumber: number) => {
    const idx = surahData.surahs.findIndex((s) => s.surah_number === surahNumber);
    if (idx !== -1) {
      setSelectedSurahIdx(idx);
      setPlayingAyah(null);
      setRecitingSurah(false);
      setCurrentAyahIdx(null);
      setShowSurahList(false);
      setShowAudioControls(false);
    }
  };

  const handleBookmarkToggle = (verse_number: number) => {
    if (isBookmarked(surah.surah_number, verse_number)) {
      removeBookmark(surah.surah_number, verse_number);
    } else {
      addBookmark(surah.surah_number, verse_number);
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small": return "text-2xl leading-[2.5rem]";
      case "medium": return "text-3xl leading-[3.5rem]";
      case "large": return "text-4xl leading-[4rem]";
      case "xl": return "text-5xl leading-[5rem]";
      default: return "text-3xl leading-[3.5rem]";
    }
  };

  const bgColor = settings.darkMode ? "bg-[#1a1a1a]" : "bg-[#f5f3eb]";
  const cardBgColor = settings.darkMode ? "bg-[#2d2d2d]" : "bg-[#f9f7f3]";
  const textColor = settings.darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]";
  const secondaryTextColor = settings.darkMode ? "text-[#bfa76a]" : "text-[#7c6f57]";

  return (
    <div className={`min-h-screen flex ${bgColor} relative overflow-hidden`}>
      {showSurahList && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSurahList(false)} />
          <div className={`fixed lg:sticky lg:top-0 left-0 h-screen w-80 ${cardBgColor} shadow-2xl z-50 flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b-2 border-[#e2c275] flex-shrink-0">
              <h2 className={`text-xl font-bold ${textColor}`}>📖 Surahs</h2>
              <button onClick={() => setShowSurahList(false)} className="lg:hidden w-8 h-8 rounded-full hover:bg-[#e2c275]/20 flex items-center justify-center">✕</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SurahList onSelectSurah={handleSelectSurah} selectedSurah={surah.surah_number} />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
        <div className="w-full max-w-4xl mb-4 flex items-center gap-2 justify-between">
          <button onClick={() => setShowSurahList(!showSurahList)} className="px-4 py-2 bg-[#bfa76a] text-white rounded-lg hover:bg-[#e2c275] transition font-medium shadow">
            📚 Surahs
          </button>
          <div className="flex gap-2">
            <button onClick={() => toggleFavorite(surah.surah_number)} className={`px-4 py-2 rounded-lg transition font-medium shadow ${isFavorite(surah.surah_number) ? "bg-[#e2c275] text-white" : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275] hover:text-white"}`}>
              {isFavorite(surah.surah_number) ? "⭐" : "☆"}
            </button>
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-[#ffe9a7] text-[#7c6f57] rounded-lg hover:bg-[#e2c275] hover:text-white transition font-medium shadow">⚙️</button>
          </div>
        </div>

        <div className={`w-full max-w-4xl min-h-[650px] max-h-[650px] flex flex-col p-6 rounded-2xl shadow-2xl ${cardBgColor} border-4 border-[#e2c275] relative overflow-hidden`} style={{backgroundImage: settings.darkMode ? "none" : "url('https://www.transparenttextures.com/patterns/arabesque.png')", backgroundRepeat: "repeat", backgroundSize: "auto"}}>
          
          <div className="flex justify-between mb-4 gap-2">
            <select className="flex-1 border border-[#e2c275] rounded px-3 py-1 bg-white text-[#7c6f57] focus:outline-none text-sm" value={selectedSurahIdx} onChange={(e) => { setSelectedSurahIdx(Number(e.target.value)); setPlayingAyah(null); setRecitingSurah(false); setCurrentAyahIdx(null); setShowAudioControls(false); }}>
              {surahData.surahs.map((s, idx) => (
                <option key={s.surah_number} value={idx}>{s.surah_number}. {s.surah_name} ({s.surah_englishName})</option>
              ))}
            </select>
            <select className="border border-[#e2c275] rounded px-3 py-1 bg-white text-[#7c6f57] focus:outline-none text-sm" value={reciterId} onChange={(e) => setReciterId(Number(e.target.value))}>
              {reciters.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <h1 className={`text-2xl font-bold mb-4 text-center text-white bg-[#bfa76a] rounded-full px-6 py-2 shadow cursor-pointer hover:bg-[#e2c275] transition ${textColor}`} title="Click to recite complete surah" onClick={startReciteSurah}>
            {surah.surah_name} <span className="text-base text-white">({surah.surah_englishName})</span>
          </h1>

          {showBismillah && (
            <>
              <div className={`text-3xl text-center font-[Amiri,serif] mb-4 tracking-wide drop-shadow ${settings.darkMode ? "text-[#e2c275]" : "text-[#bfa76a]"}`}>
                {BISMILLAH.arabic}
              </div>
              <div className="flex justify-center mb-8">
                <div className="w-32 h-1 bg-gradient-to-r from-[#e2c275] via-[#fffbe6] to-[#e2c275] rounded-full" />
              </div>
            </>
          )}

          <div className="flex-1 overflow-y-auto mb-4" style={{minHeight: "0", maxHeight: "340px", direction: "rtl", textAlign: "center", wordBreak: "break-word"}}>
            <div className={`${getFontSizeClass()} font-[Amiri,serif] ${textColor} break-words relative`}>
              {pagedAyahs.map((ayah, idx) => {
                const absoluteIdx = page * PAGE_SIZE + idx;
                const bookmarked = isBookmarked(surah.surah_number, ayah.verse_number);
                return (
                  <React.Fragment key={ayah.verse_number}>
                    <span className={`inline transition-colors duration-200 px-2 py-1 cursor-pointer rounded-md ${hoveredAyah === ayah.verse_number ? (settings.darkMode ? "text-[#fffbe6]" : "text-[#bfa76a]") : playingAyah === ayah.verse_number ? "bg-[#e2c275] text-white" : ""}`} onMouseEnter={() => setHoveredAyah(ayah.verse_number)} onMouseLeave={() => setHoveredAyah(null)} onClick={() => handleAyahClick(ayah.verse_number, absoluteIdx)}>
                      {ayah.arabic}
                    </span>
                    <span className="relative inline-block ayah-number-tooltip group align-middle">
                      <span 
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full mx-1 font-bold border border-[#e2c275] shadow-sm text-xs cursor-pointer transition-colors duration-200 relative ${hoveredAyah === ayah.verse_number ? "text-[#bfa76a] bg-[#fffbe6]" : playingAyah === ayah.verse_number ? "bg-[#e2c275] text-white" : selectedAyahForTranslation === ayah.verse_number ? "bg-[#bfa76a] text-white" : "bg-[#ffe9a7] text-[#7c6f57]"}`} 
                        tabIndex={0} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedAyahForTranslation === ayah.verse_number) {
                            setSelectedAyahForTranslation(null);
                          } else {
                            setSelectedAyahForTranslation(ayah.verse_number);
                          }
                        }}
                        onDoubleClick={() => handleAyahClick(ayah.verse_number, absoluteIdx)}
                        onMouseEnter={() => setHoveredAyah(ayah.verse_number)} 
                        onMouseLeave={() => setHoveredAyah(null)} 
                        style={{verticalAlign: "middle", fontFamily: "inherit"}}
                      >
                        {ayah.verse_number}
                        {bookmarked && <span className="absolute -top-1 -right-1 text-[10px]">📌</span>}
                        {hoveredAyah === ayah.verse_number && selectedAyahForTranslation !== ayah.verse_number && (
                          <span className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#bfa76a] text-white text-xs whitespace-nowrap shadow z-20">
                            Click: Translation | Double: Audio
                          </span>
                        )}
                      </span>
                    </span>
                    {idx !== pagedAyahs.length - 1 && <span> </span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Translation Panel */}
          {settings.showTranslation && selectedAyahForTranslation !== null && (() => {
            const selectedAyah = ayahs.find(a => a.verse_number === selectedAyahForTranslation);
            if (!selectedAyah) return null;
            return (
              <div className={`mb-3 p-4 rounded-xl border-2 border-[#e2c275] ${settings.darkMode ? "bg-[#1a1a1a]" : "bg-[#fffbe6]"} shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${textColor} flex items-center gap-2`}>
                    <span className="text-[#bfa76a]">📖</span>
                    Ayah {selectedAyah.verse_number}
                  </h3>
                  <button 
                    onClick={() => setSelectedAyahForTranslation(null)}
                    className="text-[#7c6f57] hover:text-[#bfa76a] transition"
                  >
                    ✕
                  </button>
                </div>
                
                {(settings.translationLanguage === "urdu" || settings.translationLanguage === "both") && (
                  <div className="mb-3">
                    <p className={`text-base ${secondaryTextColor} text-right leading-relaxed`} style={{fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl"}}>
                      {selectedAyah.ur_translation}
                    </p>
                  </div>
                )}
                
                {(settings.translationLanguage === "english" || settings.translationLanguage === "both") && (
                  <div className="mb-3">
                    <p className={`text-sm ${secondaryTextColor} leading-relaxed`}>
                      {selectedAyah.en_translation}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 justify-end pt-2 border-t border-[#e2c275]/30">
                  <button 
                    onClick={() => handleAyahClick(selectedAyah.verse_number, ayahs.indexOf(selectedAyah))}
                    className="px-3 py-1.5 bg-[#bfa76a] text-white rounded-lg hover:bg-[#e2c275] transition text-sm font-medium"
                  >
                    🎵 Play Audio
                  </button>
                  <button 
                    onClick={() => handleBookmarkToggle(selectedAyah.verse_number)}
                    className={`px-3 py-1.5 rounded-lg transition text-sm font-medium ${isBookmarked(surah.surah_number, selectedAyah.verse_number) ? "bg-[#e2c275] text-white" : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275] hover:text-white"}`}
                  >
                    {isBookmarked(surah.surah_number, selectedAyah.verse_number) ? "🔖 Bookmarked" : "📌 Bookmark"}
                  </button>
                </div>
              </div>
            );
          })()}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-2 mb-2">
              <button className={`px-3 py-1 rounded-lg bg-[#ffe9a7] text-[#bfa76a] border border-[#e2c275] font-bold shadow hover:bg-[#e2c275] hover:text-white transition disabled:opacity-40`} onClick={() => setPage(page - 1)} disabled={page === 0}>
                &lt; Prev
              </button>
              <span className="text-[#bfa76a] font-semibold text-base px-2">Page {page + 1} of {totalPages}</span>
              <button className="px-3 py-1 rounded-lg bg-[#ffe9a7] text-[#bfa76a] border border-[#e2c275] font-bold shadow hover:bg-[#e2c275] hover:text-white transition disabled:opacity-40" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>
                Next &gt;
              </button>
            </div>
          )}

          {playingAyah !== null && (
            <div className="mt-2">
              <EnhancedAudioPlayer 
                key={`${surah.surah_number}-${playingAyah}`}
                src={getAyahAudioUrl(reciterId, surah.surah_number, playingAyah)} 
                showControls={showAudioControls}
                autoPlay 
                onEnded={handleAyahEnd} 
                isPlaying={true}
                volume={volume}
                onVolumeChange={setVolume}
              />
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const SurahPage: React.FC = () => {
  return (
    <BookmarkProvider>
      <SurahReaderContent />
    </BookmarkProvider>
  );
};

export default SurahPage;
