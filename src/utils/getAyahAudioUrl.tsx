export function getAyahAudioUrl(reciterId: number, surahNo: number, ayahNo: number) {
  return `https://the-quran-project.github.io/Quran-Audio/Data/${reciterId}/${surahNo}_${ayahNo}.mp3`;
}