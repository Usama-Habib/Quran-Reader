"use client";
import React, { useState, useEffect } from "react";
import { getAyahAudioUrl } from "../src/utils/getAyahAudioUrl";
import SurahList from "../src/components/SurahList";
import BookmarksView from "../src/components/BookmarksView";
import SettingsPanel, { ReaderSettings } from "../src/components/SettingsPanel";
import TranslationPanel from "../src/components/TranslationPanel";
import EnhancedAudioPlayer from "../src/components/EnhancedAudioPlayer";
import { BookmarkProvider, useBookmarks } from "../src/context/BookmarkContext";
import { fetchSurah, Surah } from "../src/services/quranApi";

const reciters = [
  { id: 1, name: "Mishary Rashid Al Afasy" },
  { id: 2, name: "Abu Bakr Al Shatri" },
  { id: 3, name: "Nasser Al Qatami" },
  { id: 4, name: "Yasser Al Dosari" },
  { id: 5, name: "Hani Ar Rifai" },
];

const SurahReaderContent: React.FC = () => {
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [recitingSurah, setRecitingSurah] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState<number>(1);
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [selectedAyahForTranslation, setSelectedAyahForTranslation] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [sidebarView, setSidebarView] = useState<"surahs" | "bookmarks">("surahs");

  const { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleFavorite, isFavorite, setLastRead } = useBookmarks();

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

  useEffect(() => {
    loadSurah(1);
  }, []);

  const loadSurah = async (surahNumber: number) => {
    setLoading(true);
    const surah = await fetchSurah(surahNumber);
    if (surah) {
      setCurrentSurah(surah);
    }
    setLoading(false);
  };

  const ayahs = currentSurah?.ayahs || [];
  
  // Check if first ayah is Bismillah to avoid duplication
  const firstAyahIsBismillah = ayahs.length > 0 && ayahs[0].text.includes("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
  const displayAyahs = (currentSurah?.number === 1 || currentSurah?.number === 9 || firstAyahIsBismillah) ? ayahs : ayahs;

  const startReciteSurah = () => {
    setRecitingSurah(true);
    setCurrentAyahIdx(0);
    setPlayingAyah(ayahs[0].numberInSurah);
    setShowAudioControls(true);
  };

  const handleAyahEnd = () => {
    if (recitingSurah && currentAyahIdx !== null) {
      if (currentAyahIdx < ayahs.length - 1) {
        const nextIdx = currentAyahIdx + 1;
        setCurrentAyahIdx(nextIdx);
        setPlayingAyah(ayahs[nextIdx].numberInSurah);
        setLastRead(currentSurah!.number, ayahs[nextIdx].numberInSurah);
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

  const handleAyahClick = (ayahNumberInSurah: number) => {
    setRecitingSurah(false);
    setCurrentAyahIdx(null);
    setPlayingAyah(ayahNumberInSurah);
    setShowAudioControls(true);
    setLastRead(currentSurah!.number, ayahNumberInSurah);
  };

  const handleSelectSurah = async (surahNumber: number) => {
    setPlayingAyah(null);
    setRecitingSurah(false);
    setCurrentAyahIdx(null);
    setShowAudioControls(false);
    setSelectedAyahForTranslation(null);
    await loadSurah(surahNumber);
  };

  const handleSelectBookmark = async (surahNumber: number, ayahNumber: number) => {
    if (currentSurah?.number !== surahNumber) {
      await loadSurah(surahNumber);
    }
    setTimeout(() => {
      const ayahElement = document.getElementById(`ayah-${ayahNumber}`);
      if (ayahElement) {
        ayahElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHoveredAyah(ayahNumber);
        setTimeout(() => setHoveredAyah(null), 2000);
      }
    }, 300);
  };

  const handleBookmarkToggle = (ayahNumberInSurah: number) => {
    if (isBookmarked(currentSurah!.number, ayahNumberInSurah)) {
      removeBookmark(currentSurah!.number, ayahNumberInSurah);
    } else {
      addBookmark(currentSurah!.number, ayahNumberInSurah);
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small": return "text-3xl";
      case "medium": return "text-4xl";
      case "large": return "text-5xl";
      case "xl": return "text-6xl";
      default: return "text-4xl";
    }
  };

  const bgColor = settings.darkMode ? "bg-[#1a1a1a]" : "bg-[#f5f3eb]";
  const cardBgColor = settings.darkMode ? "bg-[#2d2d2d]" : "bg-[#fffef8]";
  const textColor = settings.darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]";
  const secondaryTextColor = settings.darkMode ? "text-[#bfa76a]" : "text-[#7c6f57]";

  if (!currentSurah) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#bfa76a] mx-auto mb-4"></div>
          <p className={`text-xl ${textColor}`}>Loading Quran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${bgColor} overflow-hidden`}>
      {/* Sidebar - Always Visible */}
      <div className={`w-80 ${cardBgColor} shadow-2xl flex flex-col border-r-2 border-[#e2c275]`}>
        {/* Sidebar Header */}
        <div className="flex-shrink-0 border-b-2 border-[#e2c275]">
          <div className="flex">
            <button
              onClick={() => setSidebarView("surahs")}
              className={`flex-1 py-4 px-4 font-bold transition ${
                sidebarView === "surahs"
                  ? `${settings.darkMode ? "bg-[#3a3a3a]" : "bg-[#fffbe6]"} ${textColor} border-b-2 border-[#bfa76a]`
                  : `${secondaryTextColor} hover:bg-[#e2c275]/10`
              }`}
            >
              📖 Surahs
            </button>
            <button
              onClick={() => setSidebarView("bookmarks")}
              className={`flex-1 py-4 px-4 font-bold transition relative ${
                sidebarView === "bookmarks"
                  ? `${settings.darkMode ? "bg-[#3a3a3a]" : "bg-[#fffbe6]"} ${textColor} border-b-2 border-[#bfa76a]`
                  : `${secondaryTextColor} hover:bg-[#e2c275]/10`
              }`}
            >
              📌 Bookmarks
              {bookmarks.length > 0 && (
                <span className="absolute top-2 right-2 bg-[#e2c275] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {sidebarView === "surahs" ? (
            <SurahList onSelectSurah={handleSelectSurah} selectedSurah={currentSurah.number} />
          ) : (
            <BookmarksView onSelectBookmark={handleSelectBookmark} darkMode={settings.darkMode} />
          )}
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={`flex-shrink-0 ${cardBgColor} border-b-2 border-[#e2c275] px-6 py-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            {/* Surah Info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <span className="font-[Amiri,serif] text-3xl">{currentSurah.name}</span>
                  <span className={secondaryTextColor}>•</span>
                  <span className="text-xl">{currentSurah.englishName}</span>
                </h1>
                <p className={`text-sm ${secondaryTextColor} mt-1`}>
                  {currentSurah.englishNameTranslation} • {currentSurah.revelationType} • {currentSurah.numberOfAyahs} Ayahs
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={startReciteSurah}
                className="px-4 py-2 bg-[#bfa76a] text-white rounded-lg hover:bg-[#e2c275] transition font-medium shadow flex items-center gap-2"
              >
                🎵 Play Surah
              </button>
              <button
                onClick={() => toggleFavorite(currentSurah.number)}
                className={`px-3 py-2 rounded-lg transition font-medium shadow ${
                  isFavorite(currentSurah.number)
                    ? "bg-[#e2c275] text-white"
                    : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275] hover:text-white"
                }`}
              >
                {isFavorite(currentSurah.number) ? "⭐" : "☆"}
              </button>
              <select
                className="border border-[#e2c275] rounded-lg px-3 py-2 bg-white text-[#7c6f57] focus:outline-none text-sm"
                value={reciterId}
                onChange={(e) => setReciterId(Number(e.target.value))}
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 bg-[#ffe9a7] text-[#7c6f57] rounded-lg hover:bg-[#e2c275] hover:text-white transition font-medium shadow"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Quran Reading Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bfa76a]"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {displayAyahs.map((ayah, idx) => {
                  const bookmarked = isBookmarked(currentSurah.number, ayah.numberInSurah);
                  const isPlaying = playingAyah === ayah.numberInSurah;
                  const isHovered = hoveredAyah === ayah.numberInSurah;

                  return (
                    <div
                      key={ayah.number}
                      id={`ayah-${ayah.numberInSurah}`}
                      className={`group p-6 rounded-xl transition-all duration-300 ${
                        isPlaying
                          ? "bg-[#e2c275]/20 shadow-lg scale-[1.01]"
                          : isHovered
                          ? settings.darkMode
                            ? "bg-[#3a3a3a]"
                            : "bg-[#fffbe6]"
                          : settings.darkMode
                          ? "bg-[#2d2d2d]/50"
                          : "bg-white/50"
                      } backdrop-blur-sm border-2 ${
                        isPlaying ? "border-[#e2c275]" : "border-transparent"
                      }`}
                      onMouseEnter={() => setHoveredAyah(ayah.numberInSurah)}
                      onMouseLeave={() => setHoveredAyah(null)}
                    >
                      {/* Ayah Number Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            isPlaying
                              ? "bg-[#e2c275] text-white"
                              : settings.darkMode
                              ? "bg-[#3a3a3a]"
                              : "bg-[#fffbe6]"
                          } border-2 border-[#e2c275]`}
                        >
                          <span className={`font-bold ${isPlaying ? "text-white" : textColor}`}>
                            {ayah.numberInSurah}
                          </span>
                          {bookmarked && <span>📌</span>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedAyahForTranslation(ayah.numberInSurah)}
                            className="px-3 py-1.5 bg-[#bfa76a] text-white rounded-lg hover:bg-[#e2c275] transition text-sm font-medium"
                            title="View Translation"
                          >
                            📖
                          </button>
                          <button
                            onClick={() => handleAyahClick(ayah.numberInSurah)}
                            className="px-3 py-1.5 bg-[#bfa76a] text-white rounded-lg hover:bg-[#e2c275] transition text-sm font-medium"
                            title="Play Audio"
                          >
                            🎵
                          </button>
                          <button
                            onClick={() => handleBookmarkToggle(ayah.numberInSurah)}
                            className={`px-3 py-1.5 rounded-lg transition text-sm font-medium ${
                              bookmarked
                                ? "bg-[#e2c275] text-white"
                                : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275] hover:text-white"
                            }`}
                            title={bookmarked ? "Remove Bookmark" : "Bookmark"}
                          >
                            {bookmarked ? "🔖" : "📌"}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      <div
                        className={`${getFontSizeClass()} font-[Amiri,serif] ${textColor} leading-relaxed mb-4 text-right`}
                        style={{ direction: "rtl", lineHeight: "2.2" }}
                      >
                        {ayah.text}
                      </div>

                      {/* Translation (if enabled) */}
                      {settings.showTranslation && (
                        <div className="space-y-3 pt-4 border-t border-[#e2c275]/30">
                          {(settings.translationLanguage === "urdu" ||
                            settings.translationLanguage === "both") &&
                            ayah.translations?.urdu && (
                              <div className="text-right">
                                <p
                                  className={`text-lg ${secondaryTextColor} leading-relaxed`}
                                  style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}
                                >
                                  {ayah.translations.urdu}
                                </p>
                              </div>
                            )}

                          {(settings.translationLanguage === "english" ||
                            settings.translationLanguage === "both") &&
                            ayah.translations?.english && (
                              <div>
                                <p className={`text-base ${secondaryTextColor} leading-relaxed`}>
                                  {ayah.translations.english}
                                </p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Audio Player - Bottom Bar */}
        {playingAyah !== null && (
          <div className={`flex-shrink-0 ${cardBgColor} border-t-2 border-[#e2c275] p-4 shadow-lg`}>
            <EnhancedAudioPlayer
              key={`${currentSurah.number}-${playingAyah}`}
              src={getAyahAudioUrl(reciterId, currentSurah.number, playingAyah)}
              showControls={true}
              autoPlay
              onEnded={handleAyahEnd}
              isPlaying={true}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}

      {selectedAyahForTranslation !== null &&
        (() => {
          const selectedAyah = ayahs.find((a) => a.numberInSurah === selectedAyahForTranslation);
          if (!selectedAyah) return null;
          return (
            <TranslationPanel
              ayah={selectedAyah}
              surahNumber={currentSurah.number}
              onClose={() => setSelectedAyahForTranslation(null)}
              onPlayAudio={() => {
                setSelectedAyahForTranslation(null);
                handleAyahClick(selectedAyah.numberInSurah);
              }}
              onToggleBookmark={() => handleBookmarkToggle(selectedAyah.numberInSurah)}
              isBookmarked={isBookmarked(currentSurah.number, selectedAyah.numberInSurah)}
              settings={settings}
              darkMode={settings.darkMode}
            />
          );
        })()}
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
