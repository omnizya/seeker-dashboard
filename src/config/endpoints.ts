type positionT = {
  lat: number;
  lng: number;
};
export const SUNRISE_SUNSET = ({
  lat = 33.456444,
  lng = -7.650666,
}: positionT) => `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}`;

enum methodE {
  "fehres",
  "getSurat",
  "getAyah",
}
interface iQuranAPI {
  method: methodE;
  params?: number;
}
enum SurahT {
  "meccan",
  "medinan",
}
export type QuranT = Surah[];
export interface SurahData {
  id: number;
  name: string;
  type: SurahT;
  total_verses: number;
  link: string;
}
export interface Surah {
  id: number;
  name: string;
  type: SurahT;
  total_verses: number;
  verses: Ayah[];
}
export interface Ayah {
  id: number;
  text: string;
}
export function QuranAPI({ method, params = 1 }: iQuranAPI): string {
  const base = "https://cdn.jsdelivr.net/npm/quran-json";
  const version = "3.1.2";
  const api_base = `${base}@${version}/dist/`;
  const quran = `${api_base}quran.json`;
  const fehres = `${api_base}chapters/index.json`;
  const getSurat = (sura: number) => `${api_base}chapters/${sura}.json`;
  const getAyah = (ayah: number) => `${api_base}verses/${ayah}.json`;
  switch (method) {
    case methodE.fehres:
      return fehres;
    case methodE.getSurat:
      return getSurat(params);
    case methodE.getAyah:
      return getAyah(params);
    default:
      return quran;
  }
}

QuranAPI({ method: methodE.fehres });
