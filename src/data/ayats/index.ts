import fs from 'fs';
import path from 'path';

export const DATA_PATH = path.join(process.cwd(), 'src/data/ayats/data.jsonl');

export type AyahVector = [number, string, number, number, number, number, number];

export function parseAyahVector(vector: AyahVector) {
  return {
    id: vector[0],
    ayah: vector[1],
    grand_east: vector[2],
    grand_west: vector[3],
    small_east: vector[4],
    small_west: vector[5],
    nafsy: vector[6],
  };
}

// Read all into an array of vectors
export function getAyatsVectors(): AyahVector[] {
  const content = fs.readFileSync(DATA_PATH, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

// Read all into an array of objects
export default function getAyats() {
  return getAyatsVectors().map(parseAyahVector);
}
