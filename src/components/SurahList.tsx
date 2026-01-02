"use client";

import React, { useState } from "react";
import { surahList, SurahInfo } from "../data/surahList";

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
  selectedSurah?: number;
}

const SurahList: React.FC<SurahListProps> = ({ onSelectSurah, selectedSurah }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">("all");

  const filteredSurahs = surahList.filter((surah) => {
    const matchesSearch =
      surah.name.includes(searchTerm) ||
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm);

    const matchesFilter = filterType === "all" || surah.revelationType === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 bg-[#f9f7f3] border-b-2 border-[#e2c275] flex-shrink-0">
        <input
          type="text"
          placeholder="Search Surah by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-[#e2c275] focus:outline-none focus:border-[#bfa76a] bg-white text-[#3a2e1a]"
        />
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filterType === "all"
                ? "bg-[#bfa76a] text-white"
                : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275]"
            }`}
          >
            All (114)
          </button>
          <button
            onClick={() => setFilterType("Meccan")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filterType === "Meccan"
                ? "bg-[#bfa76a] text-white"
                : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275]"
            }`}
          >
            Meccan (86)
          </button>
          <button
            onClick={() => setFilterType("Medinan")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filterType === "Medinan"
                ? "bg-[#bfa76a] text-white"
                : "bg-[#ffe9a7] text-[#7c6f57] hover:bg-[#e2c275]"
            }`}
          >
            Medinan (28)
          </button>
        </div>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto bg-[#f5f3eb]">
        {filteredSurahs.map((surah) => (
          <div
            key={surah.number}
            onClick={() => onSelectSurah(surah.number)}
            className={`p-4 cursor-pointer transition border-b border-[#e2c275]/30 hover:bg-[#fffbe6] ${
              selectedSurah === surah.number ? "bg-[#e2c275] text-white" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left: Number Badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                  selectedSurah === surah.number
                    ? "border-white text-white"
                    : "border-[#bfa76a] text-[#bfa76a]"
                }`}
              >
                {surah.number}
              </div>

              {/* Middle: Surah Details */}
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold text-base ${
                      selectedSurah === surah.number ? "text-white" : "text-[#3a2e1a]"
                    }`}
                  >
                    {surah.englishName}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      selectedSurah === surah.number
                        ? "bg-white/20 text-white"
                        : surah.revelationType === "Meccan"
                        ? "bg-[#bfa76a]/20 text-[#7c6f57]"
                        : "bg-[#e2c275]/30 text-[#7c6f57]"
                    }`}
                  >
                    {surah.revelationType}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    selectedSurah === surah.number ? "text-white/90" : "text-[#7c6f57]"
                  }`}
                >
                  {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                </p>
              </div>

              {/* Right: Arabic Name */}
              <div
                className={`text-right font-[Amiri,serif] text-xl ${
                  selectedSurah === surah.number ? "text-white" : "text-[#bfa76a]"
                }`}
              >
                {surah.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurahList;
