export function getAyahAudioUrl(reciterId: number, surahNo: number, ayahNo: number) {
  // Format: https://everyayah.com/data/reciter_name/surahNo_ayahNo.mp3
  const reciters: { [key: number]: string } = {
    1: 'Abdul_Basit_Murattal_64kbps',
    2: 'Abdurrahmaan_As-Sudais_64kbps',
    3: 'Saood_ash-Shuraym_64kbps',
    5: 'Maher_AlMuaiqly_64kbps',
    7: 'Alafasy_64kbps',
    9: 'Abu_Bakr_Ash-Shaatree_64kbps'
  };

  const reciterName = reciters[reciterId] || reciters[7];
  const paddedSurah = surahNo.toString().padStart(3, '0');
  const paddedAyah = ayahNo.toString().padStart(3, '0');
  
  return `https://everyayah.com/data/${reciterName}/${paddedSurah}${paddedAyah}.mp3`;
}