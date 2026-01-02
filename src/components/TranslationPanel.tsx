"use client";

import React from "react";
import { ReaderSettings } from "./SettingsPanel";

interface Ayah {
  numberInSurah: number;
  text: string;
  translations?: {
    english?: string;
    urdu?: string;
  };
}

interface TranslationPanelProps {
  ayah: Ayah;
  surahNumber: number;
  onClose: () => void;
  onPlayAudio: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  settings: ReaderSettings;
  darkMode: boolean;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  ayah,
  surahNumber,
  onClose,
  onPlayAudio,
  onToggleBookmark,
  isBookmarked,
  settings,
  darkMode,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end lg:items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border-4 border-[#e2c275] max-h-[80vh] flex flex-col ${
          darkMode ? "bg-[#2d2d2d]" : "bg-[#fffbe6]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#e2c275] flex-shrink-0">
          <h3
            className={`text-xl font-bold flex items-center gap-2 ${
              darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]"
            }`}
          >
            <span className="text-[#bfa76a]">📖</span>
            Surah {surahNumber}, Ayah {ayah.numberInSurah}
          </h3>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              darkMode
                ? "hover:bg-white/10 text-[#e2c275]"
                : "hover:bg-[#e2c275]/20 text-[#7c6f57]"
            }`}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Arabic Text */}
          <div className="text-center">
            <div
              className={`text-4xl leading-[4rem] font-[Amiri,serif] mb-4 ${
                darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]"
              }`}
              style={{ direction: "rtl" }}
            >
              {ayah.text}
            </div>
          </div>

          {settings.showTranslation && (
            <>
              {/* Urdu Translation */}
              {(settings.translationLanguage === "urdu" ||
                settings.translationLanguage === "both") &&
                ayah.translations?.urdu && (
                  <div className="space-y-2">
                    <h4
                      className={`text-sm font-bold uppercase tracking-wide ${
                        darkMode ? "text-[#bfa76a]" : "text-[#7c6f57]"
                      }`}
                    >
                      Urdu Translation
                    </h4>
                    <p
                      className={`text-xl leading-relaxed text-right ${
                        darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]"
                      }`}
                      style={{
                        fontFamily: "'Noto Nastaliq Urdu', serif",
                        direction: "rtl",
                      }}
                    >
                      {ayah.translations.urdu}
                    </p>
                  </div>
                )}

              {/* English Translation */}
              {(settings.translationLanguage === "english" ||
                settings.translationLanguage === "both") &&
                ayah.translations?.english && (
                  <div className="space-y-2">
                    <h4
                      className={`text-sm font-bold uppercase tracking-wide ${
                        darkMode ? "text-[#bfa76a]" : "text-[#7c6f57]"
                      }`}
                    >
                      English Translation
                    </h4>
                    <p
                      className={`text-lg leading-relaxed ${
                        darkMode ? "text-[#e2c275]/90" : "text-[#3a2e1a]"
                      }`}
                    >
                      {ayah.translations.english}
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="p-4 border-t-2 border-[#e2c275] flex gap-3 flex-shrink-0">
          <button
            onClick={onPlayAudio}
            className="flex-1 py-3 bg-[#bfa76a] text-white rounded-xl hover:bg-[#e2c275] transition font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            🎵 Play Audio
          </button>
          <button
            onClick={onToggleBookmark}
            className={`flex-1 py-3 rounded-xl transition font-semibold shadow-lg flex items-center justify-center gap-2 ${
              isBookmarked
                ? "bg-[#e2c275] text-white hover:bg-[#bfa76a]"
                : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275] hover:text-white"
            }`}
          >
            {isBookmarked ? "🔖 Bookmarked" : "📌 Bookmark"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationPanel;
