"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
  note?: string;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  favorites: number[];
  addBookmark: (surahNumber: number, ayahNumber: number, note?: string) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  toggleFavorite: (surahNumber: number) => void;
  isFavorite: (surahNumber: number) => boolean;
  lastRead: { surahNumber: number; ayahNumber: number } | null;
  setLastRead: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarkProvider");
  }
  return context;
};

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [lastRead, setLastReadState] = useState<{
    surahNumber: number;
    ayahNumber: number;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("quran-bookmarks");
    const savedFavorites = localStorage.getItem("quran-favorites");
    const savedLastRead = localStorage.getItem("quran-last-read");

    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    if (savedLastRead) {
      try {
        setLastReadState(JSON.parse(savedLastRead));
      } catch (e) {
        console.error("Failed to parse last read", e);
      }
    }
  }, []);

  // Save to localStorage when bookmarks change
  useEffect(() => {
    localStorage.setItem("quran-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save to localStorage when favorites change
  useEffect(() => {
    localStorage.setItem("quran-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Save to localStorage when lastRead changes
  useEffect(() => {
    if (lastRead) {
      localStorage.setItem("quran-last-read", JSON.stringify(lastRead));
    }
  }, [lastRead]);

  const addBookmark = (surahNumber: number, ayahNumber: number, note?: string) => {
    const newBookmark: Bookmark = {
      surahNumber,
      ayahNumber,
      timestamp: Date.now(),
      note,
    };
    setBookmarks((prev) => {
      // Remove existing bookmark for same location if any
      const filtered = prev.filter(
        (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      );
      return [...filtered, newBookmark];
    });
  };

  const removeBookmark = (surahNumber: number, ayahNumber: number) => {
    setBookmarks((prev) =>
      prev.filter((b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber))
    );
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  const toggleFavorite = (surahNumber: number) => {
    setFavorites((prev) => {
      if (prev.includes(surahNumber)) {
        return prev.filter((s) => s !== surahNumber);
      } else {
        return [...prev, surahNumber];
      }
    });
  };

  const isFavorite = (surahNumber: number) => {
    return favorites.includes(surahNumber);
  };

  const setLastRead = (surahNumber: number, ayahNumber: number) => {
    setLastReadState({ surahNumber, ayahNumber });
  };

  const value: BookmarkContextType = {
    bookmarks,
    favorites,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleFavorite,
    isFavorite,
    lastRead,
    setLastRead,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};
