import { CalcJomalT } from "~/types";

const classNames = (classes: string[]): string => classes.join(" ");
const reducedJomal = (params: number): number =>
  params
    .toString()
    .split("")
    .map((e) => parseInt(e))
    .reduce((a, b) => a + b);
const tweenttyEight: string = "أبجدهوزحطيكلمنسعفصقرشتثخذضظغ";

const Pyro = "ا ه ط م ف س ذ";
const Anemo = "ب و ي ن ض ت ظ";
const Aqua = "ج ز ك ص ق ث غ";
const Tera = "د ح ل ع ر خ ش";
export const Triangle = [Pyro, Anemo, Aqua, Tera];
const fiveNineNineFive: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300,
  400, 500, 600, 700, 800, 900, 1000,
];

const str2arr = (str: string): string[] => str.split("");
const mapKeyVal = new Map<string, number>();
// const char2int = (l: string): number | undefined => mapKeyVal.get(l);

const base = str2arr(tweenttyEight);
for (let i = 0; i < base.length; i++) {
  const element = base[i];
  mapKeyVal.set(element, fiveNineNineFive[i]);
}

// const mapKeyVal = Map.fromIterables(
//   tweenttyEight.split(""),
//   fiveNineNineFive);

// Map<String, int> printTheDict(){
//   return mapKeyVal;
// }

function CalcJomal(input: string): CalcJomalT {
  let jomal = [0, 0];
  const East: [string, number][] = [
    ["ا", 1],
    ["أ", 1],
    ["إ", 1],
    ["ء", 1],
    ["آ", 2],
    ["ئ", 1],
    ["ؤ", 1],
    ["ٱ", 1],
    ["ب", 2],
    ["ج", 3],
    ["د", 4],
    ["ه", 5],
    ["ة", 5],
    ["و", 6],
    ["ز", 7],
    ["ح", 8],
    ["ط", 9],
    ["ي", 10],
    ["ى", 10],
    ["ك", 20],
    ["ل", 30],
    ["م", 40],
    ["ن", 50],
    ["س", 60],
    ["ع", 70],
    ["ف", 80],
    ["ص", 90],
    ["ق", 100],
    ["ر", 200],
    ["ش", 300],
    ["ت", 400],
    ["ث", 500],
    ["خ", 600],
    ["ذ", 700],
    ["ض", 800],
    ["ظ", 900],
    ["غ", 1000],
  ];
  const West: [string, number][] = [
    ["ا", 1],
    ["أ", 1],
    ["إ", 1],
    ["ء", 1],
    ["آ", 2],
    ["ئ", 1],
    ["ؤ", 1],
    ["ٱ", 1],
    ["ب", 2],
    ["ج", 3],
    ["د", 4],
    ["ه", 5],
    ["ة", 5],
    ["و", 6],
    ["ز", 7],
    ["ح", 8],
    ["ط", 9],
    ["ي", 10],
    ["ى", 10],
    ["ك", 20],
    ["ل", 30],
    ["م", 40],
    ["ن", 50],
    ["س", 300],
    ["ع", 70],
    ["ف", 80],
    ["ص", 60],
    ["ق", 100],
    ["ر", 200],
    ["ش", 300],
    ["ت", 400],
    ["ث", 500],
    ["خ", 600],
    ["ذ", 700],
    ["ض", 90],
    ["ظ", 800],
    ["غ", 900],
  ];
  for (var i = 0, len = input.length; i < len; i++) {
    for (var j = 0; j < East.length; j++) {
      if (input[i] == East[j][0]) {
        jomal[0] = jomal[0] + East[j][1];
        jomal[1] = jomal[1] + West[j][1];
      }
    }
  }
  return {
    east: {
      base: jomal[0],
      reduced: reducedJomal(jomal[0]),
    },
    west: {
      base: jomal[1],
      reduced: reducedJomal(jomal[1]),
    },
  };
}

export { classNames, CalcJomal };
