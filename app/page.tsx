"use client";
import React, { useState } from "react";
import { surahData } from "../src/data/surahData";
import AudioPlayer from "../src/components/AudioPlayer";
import { getAyahAudioUrl } from "../src/utils/getAyahAudioUrl";

const reciters = [
  { id: 1, name: "Mishary Rashid Al Afasy" },
  { id: 2, name: "Abu Bakr Al Shatri" },
  { id: 3, name: "Nasser Al Qatami" },
  { id: 4, name: "Yasser Al Dosari" },
  { id: 5, name: "Hani Ar Rifai" },
];

const BISMILLAH = {
  arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  en_translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  ur_translation: "شروع الله کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔",
};

const PAGE_SIZE = 14; // Number of ayahs per page

const SurahPage: React.FC = () => {
  const [recitingSurah, setRecitingSurah] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState<number | null>(null);

  const [selectedSurahIdx, setSelectedSurahIdx] = useState(0);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState<number>(1);
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const surah = surahData.surahs[selectedSurahIdx];
  const ayahs =
    surah.surah_number === 1
      ? surah.verses.slice(1)
      : surah.verses;

  const showBismillah = surah.surah_number !== 9;

  // Pagination logic
  const totalPages = Math.ceil(ayahs.length / PAGE_SIZE);
  const pagedAyahs = ayahs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Recite complete surah logic
  const startReciteSurah = () => {
    setRecitingSurah(true);
    setCurrentAyahIdx(0);
    setPlayingAyah(ayahs[0].verse_number);
    setPage(0); // Always start from first page
  };

  // When an ayah finishes during surah recitation
  const handleAyahEnd = () => {
    if (recitingSurah && currentAyahIdx !== null) {
      if (currentAyahIdx < ayahs.length - 1) {
        const nextIdx = currentAyahIdx + 1;
        setCurrentAyahIdx(nextIdx);
        setPlayingAyah(ayahs[nextIdx].verse_number);
        // If next ayah is on next page, go to next page
        if (Math.floor(nextIdx / PAGE_SIZE) !== page) {
          setPage(Math.floor(nextIdx / PAGE_SIZE));
        }
      } else {
        setRecitingSurah(false);
        setCurrentAyahIdx(null);
        setPlayingAyah(null);
      }
    } else {
      setPlayingAyah(null);
    }
  };

  // When user clicks a single ayah, stop surah recitation
  const handleAyahClick = (verse_number: number, idx: number) => {
    setRecitingSurah(false);
    setCurrentAyahIdx(null);
    setPlayingAyah(verse_number);
    // If ayah is not on current page, go to its page
    if (Math.floor(idx / PAGE_SIZE) !== page) {
      setPage(Math.floor(idx / PAGE_SIZE));
    }
  };

  // When surah changes, reset page
  React.useEffect(() => {
    setPage(0);
  }, [selectedSurahIdx]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3eb] py-12">
      <div
        className="max-w-2xl w-full min-h-[600px] max-h-[600px] flex flex-col p-6 rounded-2xl shadow bg-[#f9f7f3] border-4 border-[#e2c275] relative overflow-hidden"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/arabesque.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        {/* Surah Navigation and Reciter Selection */}
        <div className="flex justify-between mb-4">
          <select
            className="border border-[#e2c275] rounded px-3 py-1 bg-white text-[#7c6f57] focus:outline-none"
            value={selectedSurahIdx}
            onChange={e => {
              setSelectedSurahIdx(Number(e.target.value));
              setPlayingAyah(null);
              setRecitingSurah(false);
              setCurrentAyahIdx(null);
            }}
          >
            {surahData.surahs.map((s, idx) => (
              <option key={s.surah_number} value={idx}>
                {s.surah_number}. {s.surah_name} ({s.surah_englishName})
              </option>
            ))}
          </select>
          <select
            className="border border-[#e2c275] rounded px-3 py-1 bg-white text-[#7c6f57] focus:outline-none"
            value={reciterId}
            onChange={e => setReciterId(Number(e.target.value))}
          >
            {reciters.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Surah Name Banner (clickable for recite complete surah) */}
        <h1
          className="text-2xl font-bold mb-4 text-center text-[#fff] bg-[#bfa76a] rounded-full px-6 py-2 shadow cursor-pointer hover:bg-[#e2c275] transition"
          title="Click to recite complete surah"
          onClick={startReciteSurah}
        >
          {surah.surah_name}{" "}
          <span className="text-base text-[#fff]">
            ({surah.surah_englishName})
          </span>
        </h1>

        {/* Decorative Bismillah (not for Surah 9) */}
        {showBismillah && (
          <>
            <div className="text-3xl text-center font-[Amiri,serif] text-[#bfa76a] mb-4 tracking-wide drop-shadow">
              {BISMILLAH.arabic}
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-1 bg-gradient-to-r from-[#e2c275] via-[#fffbe6] to-[#e2c275] rounded-full" />
            </div>
          </>
        )}

        {/* Fixed height ayah display area */}
        <div
          className="flex-1 overflow-y-auto mb-4"
          style={{
            minHeight: "0",
            maxHeight: "340px", // adjust as needed for your design
            direction: "rtl",
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          <div className="text-3xl font-[Amiri,serif] text-[#3a2e1a] break-words leading-[3.5rem] relative">
            {pagedAyahs.map((ayah, idx) => {
              const absoluteIdx = page * PAGE_SIZE + idx;
              return (
                <React.Fragment key={ayah.verse_number}>
                  <span
                    className={`inline transition-colors duration-200 px-2 py-1 cursor-pointer rounded-md ${
                      hoveredAyah === ayah.verse_number
                        ? "text-[#bfa76a]"
                        : playingAyah === ayah.verse_number
                        ? "bg-[#e2c275] text-white"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredAyah(ayah.verse_number)}
                    onMouseLeave={() => setHoveredAyah(null)}
                    onClick={() => handleAyahClick(ayah.verse_number, absoluteIdx)}
                  >
                    {ayah.arabic}
                  </span>
                  <span className="relative inline-block ayah-number-tooltip group align-middle">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full mx-1 font-bold border border-[#e2c275] shadow-sm text-xs cursor-pointer transition-colors duration-200
                        ${
                          hoveredAyah === ayah.verse_number
                            ? "text-[#bfa76a] bg-[#fffbe6]"
                            : playingAyah === ayah.verse_number
                            ? "bg-[#e2c275] text-white"
                            : "bg-[#ffe9a7] text-[#7c6f57]"
                        }
                      `}
                      tabIndex={0}
                      onClick={() => handleAyahClick(ayah.verse_number, absoluteIdx)}
                      onMouseEnter={() => setHoveredAyah(ayah.verse_number)}
                      onMouseLeave={() => setHoveredAyah(null)}
                      style={{
                        verticalAlign: "middle",
                        fontFamily: "inherit",
                      }}
                    >
                      {ayah.verse_number}
                      {/* Urdu Tooltip: visible ONLY when hovered */}
                      {hoveredAyah === ayah.verse_number && (
                        <span
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 rounded-xl bg-[#fffbe6] text-[#3a2e1a] text-sm shadow-lg border border-[#e2c275] z-30 min-w-[140px] max-w-[90vw] whitespace-normal break-words"
                          style={{
                            fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', 'Lato', 'Inter', sans-serif",
                            direction: "rtl",
                          }}
                        >
                          <span className="block text-[#bfa76a] font-bold mb-1">آیت {ayah.verse_number}</span>
                          <span>{ayah.ur_translation}</span>
                        </span>
                      )}
                      {/* Only show this tooltip on hover */}
                      {hoveredAyah !== ayah.verse_number && (
                        <span className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#bfa76a] text-white text-xs whitespace-nowrap shadow z-20 hidden group-hover:block">
                          Audio & Translation
                        </span>
                      )}
                    </span>
                  </span>
                  {(recitingSurah
                    ? currentAyahIdx === absoluteIdx
                    : playingAyah === ayah.verse_number) && (
                    <AudioPlayer
                      src={getAyahAudioUrl(
                        reciterId,
                        surah.surah_number,
                        ayah.verse_number
                      )}
                      onEnded={handleAyahEnd}
                      autoPlay
                    />
                  )}
                  {idx !== pagedAyahs.length - 1 && <span> </span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls - always at the bottom */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-2 mb-2">
            <button
              className="px-3 py-1 rounded-lg bg-[#ffe9a7] text-[#bfa76a] border border-[#e2c275] font-bold shadow hover:bg-[#e2c275] hover:text-white transition disabled:opacity-40"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              &lt; Prev
            </button>
            <span className="text-[#bfa76a] font-semibold text-base px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg bg-[#ffe9a7] text-[#bfa76a] border border-[#e2c275] font-bold shadow hover:bg-[#e2c275] hover:text-white transition disabled:opacity-40"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages - 1}
            >
              Next &gt;
            </button>
          </div>
        )}

        {/* Inline Translation block */}
        {/* <div className="mt-2 text-center">
          <span
            className="text-[#7c6f57] text-sm leading-relaxed"
            style={{ fontFamily: "'Noto Sans', 'Lato', 'Inter', sans-serif" }}
          >
            {pagedAyahs.map((ayah, idx) => (
              <React.Fragment key={ayah.verse_number}>
                {ayah.ur_translation}
                <span className="inline-flex items-center justify-center mx-1 mb-0.5 w-5 h-5 rounded-full bg-[#ffe9a7] text-[#bfa76a] font-bold text-[11px] border border-[#e2c275] align-middle">
                  {ayah.verse_number}
                </span>{" "}
              </React.Fragment>
            ))}
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default SurahPage;