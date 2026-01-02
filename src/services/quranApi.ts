export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translations?: {
    english?: string;
    urdu?: string;
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface Reciter {
  id: number;
  identifier: string;
  name: string;
  language: string;
  style?: string;
}

export interface Translation {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  type: string;
}

const CACHE_KEY = 'quran-cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Available translations
export const AVAILABLE_TRANSLATIONS = {
  english: [
    { identifier: 'en.asad', name: 'Muhammad Asad', language: 'en' },
    { identifier: 'en.sahih', name: 'Saheeh International', language: 'en' },
    { identifier: 'en.pickthall', name: 'Pickthall', language: 'en' },
    { identifier: 'en.yusufali', name: 'Yusuf Ali', language: 'en' },
    { identifier: 'en.hilali', name: 'Hilali & Khan', language: 'en' }
  ],
  urdu: [
    { identifier: 'ur.ahmedali', name: 'Ahmed Ali', language: 'ur' },
    { identifier: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'ur' },
    { identifier: 'ur.qadri', name: 'Tahir ul Qadri', language: 'ur' },
    { identifier: 'ur.jawadi', name: 'Syed Zeeshan Haider Jawadi', language: 'ur' }
  ]
};

// Get from cache
function getFromCache(key: string) {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(`${CACHE_KEY}-${key}`);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
  } catch (e) {
    console.error('Cache parse error:', e);
  }
  return null;
}

// Save to cache
function saveToCache(key: string, data: any) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${CACHE_KEY}-${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Cache save error:', e);
  }
}

// Fetch Surah with Arabic text and translations
export async function fetchSurah(
  surahNumber: number, 
  englishEdition: string = 'en.asad',
  urduEdition: string = 'ur.ahmedali'
): Promise<Surah | null> {
  const cacheKey = `surah-${surahNumber}-${englishEdition}-${urduEdition}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // Fetch Arabic text
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const arabicData = await arabicResponse.json();
    
    // Fetch English translation
    const englishResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${englishEdition}`);
    const englishData = await englishResponse.json();
    
    // Fetch Urdu translation
    const urduResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${urduEdition}`);
    const urduData = await urduResponse.json();

    if (arabicData.code !== 200 || englishData.code !== 200 || urduData.code !== 200) {
      console.error('API returned error');
      return null;
    }

    const surahInfo = arabicData.data;
    
    // Bismillah patterns (API uses different Unicode variations)
    const bismillahPatterns = [
      'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',  // API format
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',   // Alternative format
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'    // Mixed format
    ];
    
    const ayahs: Ayah[] = surahInfo.ayahs.map((ayah: any, index: number) => {
      let ayahText = ayah.text;
      
      // For the first ayah, remove Bismillah if present (except for Surah 1 and 9)
      if (index === 0 && surahInfo.number !== 1 && surahInfo.number !== 9) {
        bismillahPatterns.forEach(pattern => {
          ayahText = ayahText.replace(pattern, '').trim();
        });
      }
      
      return {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayahText,
        translations: {
          english: englishData.data.ayahs[index]?.text || '',
          urdu: urduData.data.ayahs[index]?.text || ''
        }
      };
    });

    const surah: Surah = {
      number: surahInfo.number,
      name: surahInfo.name,
      englishName: surahInfo.englishName,
      englishNameTranslation: surahInfo.englishNameTranslation,
      revelationType: surahInfo.revelationType,
      numberOfAyahs: surahInfo.numberOfAyahs,
      ayahs
    };

    saveToCache(cacheKey, surah);
    return surah;
  } catch (error) {
    console.error('Error fetching Surah:', error);
    return null;
  }
}

// Fetch all Surahs metadata
export async function fetchAllSurahsMetadata() {
  const cacheKey = 'all-surahs-metadata';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    
    if (data.code !== 200) {
      console.error('API returned error');
      return null;
    }

    const metadata = data.data.map((surah: any) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType
    }));

    saveToCache(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.error('Error fetching Surahs metadata:', error);
    return null;
  }
}

// Fetch available reciters
export async function fetchReciters(): Promise<Reciter[] | null> {
  const cacheKey = 'reciters-list';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.alquran.cloud/v1/edition?format=audio');
    const data = await response.json();
    
    if (data.code !== 200) {
      console.error('API returned error');
      return null;
    }

    // Filter and map reciters
    const reciters: Reciter[] = data.data
      .filter((edition: any) => edition.format === 'audio' && edition.type === 'versebyverse')
      .map((edition: any, index: number) => ({
        id: index + 1,
        identifier: edition.identifier,
        name: edition.englishName,
        language: edition.language,
        style: edition.name
      }))
      .slice(0, 20); // Limit to top 20 reciters

    saveToCache(cacheKey, reciters);
    return reciters;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    return null;
  }
}
