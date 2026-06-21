/**
 * Removes dots (tanqeet) from Arabic text.
 * Only dots from dotty letters are removed.
 * Tashkeel signs and Tahmeez letters are maintained.
 *
 * Based on Mohsen Alyafei's original (MIT).
 *
 * @param str - Arabic string to process
 * @returns The Arabic text without dots (tanqeet)
 */
export function dotLess(str: string): string {
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    let newWord = "";
    const chars = [...words[i]];
    const size = chars.length - 1;

    for (let j = 0; j <= size; j++) {
      const char = chars[j];
      let newChar = char;

      const pos = "ةبتثجخذزشضظغفقني".indexOf(char);
      if (pos !== -1) {
        newChar = "هٮٮٮححدرسصطعڡٯٮٮ"[pos];
        if (
          j === size ||
          (j <= size && !/[ء-غف-ي]/.test(chars[j + 1]))
        ) {
          if (char === "ي") newChar = "ى";
          else if (char === "ن") newChar = "ں";
        }
      }

      newWord += newChar;
    }

    words[i] = newWord;
  }

  return words.join(" ");
}
