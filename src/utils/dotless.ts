/**
 * Removes dots (tanqeet) from Arabic text.
 * Only dots from dotty letters are removed.
 * Tashkeel signs and Tahmeez letters are maintained.
 *
 * Based on Mohsen Alyafei's original (MIT).
 *
 * @param originalStr - Arabic string to process
 * @returns The Arabic text without dots (tanqeet)
 */

const MAX_CHAR_CODE = 2000;
const isArabicLetter = new Uint8Array(MAX_CHAR_CODE);
// Arabic letter range
for (let i = 1569; i <= 1594; i++) isArabicLetter[i] = 1;
for (let i = 1601; i <= 1610; i++) isArabicLetter[i] = 1;

const dotlessMap = new Uint16Array(MAX_CHAR_CODE);
for (let i = 0; i < MAX_CHAR_CODE; i++) dotlessMap[i] = i;

const dotty = "ةبتثجخذزشضظغفقني";
const nodot = "هٮٮٮححدرسصطعڡٯٮٮ";
for (let i = 0; i < dotty.length; i++) {
  dotlessMap[dotty.charCodeAt(i)] = nodot.charCodeAt(i);
}

const N_CODE = 1606; // ن
const Y_CODE = 1610; // ي
const N_END = 1722;  // ں
const Y_END = 1609;  // ى

const _dotlessCache = new Map<string, string>();

export function dotLess(originalStr: string): string {
  if (_dotlessCache.has(originalStr)) return _dotlessCache.get(originalStr)!;

  const len = originalStr.length;
  let outStr = "";

  for (let i = 0; i < len; i++) {
    let code = originalStr.charCodeAt(i);

    if (code < MAX_CHAR_CODE) {
      let mapped = dotlessMap[code];
      if (mapped !== code) {
        // Find if next character breaks the word
        const nextCode = i + 1 < len ? originalStr.charCodeAt(i + 1) : 0;
        const isEnd = nextCode >= MAX_CHAR_CODE || isArabicLetter[nextCode] === 0;

        if (isEnd) {
          if (code === N_CODE) mapped = N_END;
          else if (code === Y_CODE) mapped = Y_END;
        }

        code = mapped;
      }
    }
    outStr += String.fromCharCode(code);
  }

  _dotlessCache.set(originalStr, outStr);
  return outStr;
}
