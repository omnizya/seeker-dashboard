import { CalcJomalT } from "~/types";
import {
  GrandEast,
  SmallEast,
  GrandWest,
  SmallWest,
  Nafsy,
  LettersGemtariaTable,
} from "./gemtaria";

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
  let jomal = [0, 0, 0, 0, 0];

  for (var i = 0, len = input.length; i < len; i++) {
    for (var j = 0; j < GrandEast.length; j++) {
      if (input[i] == GrandEast[j][0]) {
        jomal[0] = jomal[0] + LettersGemtariaTable[0][j][1];
        jomal[1] = jomal[1] + LettersGemtariaTable[1][j][1];
        jomal[2] = jomal[2] + LettersGemtariaTable[2][j][1];
        jomal[3] = jomal[3] + LettersGemtariaTable[3][j][1];
        jomal[4] = jomal[4] + LettersGemtariaTable[4][j][1];
      }
    }
  }
  return {
    ge: jomal[0],
    gw: jomal[1],
    se: jomal[2],
    sw: jomal[3],
    n: jomal[4],
  };
}

export { classNames, CalcJomal };
