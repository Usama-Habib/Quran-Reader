"use client";

import React from "react";
import { useBookmarks } from "../context/BookmarkContext";
import { surahList } from "../data/surahList";

interface BookmarksViewProps {
  onSelectBookmark: (surahNumber: number, ayahNumber: number) => void;
  darkMode: boolean;
}

const BookmarksView: React.FC<BookmarksViewProps> = ({ onSelectBookmark, darkMode }) => {
  const { bookmarks } = useBookmarks();

  const textColor = darkMode ? "text-[#e2c275]" : "text-[#3a2e1a]";
  const secondaryTextColor = darkMode ? "text-[#bfa76a]" : "text-[#7c6f57]";

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-6xl mb-4">📌</div>
        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>No Bookmarks Yet</h3>
        <p className={secondaryTextColor}>
          Bookmark ayahs while reading to find them here later
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {bookmarks
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((bookmark, index) => {
            const surah = surahList.find((s) => s.number === bookmark.surahNumber);
            return (
              <div
                key={`${bookmark.surahNumber}-${bookmark.ayahNumber}-${index}`}
                onClick={() => onSelectBookmark(bookmark.surahNumber, bookmark.ayahNumber)}
                className={`p-4 cursor-pointer transition border-b ${
                  darkMode
                    ? "border-[#e2c275]/30 hover:bg-[#3a3a3a]"
                    : "border-[#e2c275]/30 hover:bg-[#fffbe6]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${textColor}`}>
                      {surah?.englishName || `Surah ${bookmark.surahNumber}`}
                    </h4>
                    <p className={`text-sm ${secondaryTextColor}`}>
                      Ayah {bookmark.ayahNumber}
                    </p>
                    {bookmark.note && (
                      <p className={`text-xs mt-2 italic ${secondaryTextColor}`}>
                        {bookmark.note}
                      </p>
                    )}
                  </div>
                  <div className="text-2xl">📌</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default BookmarksView;
