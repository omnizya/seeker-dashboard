type Harf = string;
type Sharqy = number;
type Gharby = number;
type Nafsy = number;
type LittleSharqy = number;
type LittleGharby = number;

export const JummalTable: Array<
  [Harf, Sharqy, Gharby, LittleSharqy, LittleGharby, Nafsy]
> = [
  ["ا", 1, 1, 1, 1, 1],
  ["أ", 1, 1, 1, 1, 1],
  ["إ", 1, 1, 1, 1, 1],
  ["ء", 1, 1, 1, 1, 1],
  ["آ", 1, 2, 1, 2, 1],
  ["ئ", 1, 1, 1, 1, 1],
  ["ؤ", 1, 1, 1, 1, 1],
  ["ٱ", 1, 1, 1, 1, 1],
  ["ى", 1, 2, 2, 2, 1],
  ["ب", 2, 3, 3, 3, 26],
  ["ج", 3, 4, 4, 4, 9],
  ["د", 4, 5, 5, 5, 18],
  ["ه", 5, 5, 5, 5, 2],
  ["ة", 5, 6, 6, 6, 2],
  ["و", 6, 7, 7, 7, 28],
  ["ز", 7, 8, 8, 8, 19],
  ["ح", 8, 9, 9, 9, 4],
  ["ط", 9, 10, 1, 1, 12],
  ["ي", 10, 10, 1, 1, 11],
  ["ك", 20, 20, 2, 2, 8],
  ["ل", 30, 30, 3, 3, 13],
  ["م", 40, 40, 4, 4, 27],
  ["ن", 50, 50, 5, 5, 14],
  ["س", 60, 300, 6, 3, 20],
  ["ع", 70, 70, 7, 7, 3],
  ["ف", 80, 80, 8, 8, 25],
  ["ص", 90, 60, 9, 6, 21],
  ["ق", 100, 100, 1, 1, 7],
  ["ر", 200, 200, 2, 2, 15],
  ["ش", 300, 300, 3, 3, 10],
  ["ت", 400, 400, 4, 4, 18],
  ["ث", 500, 500, 5, 5, 23],
  ["خ", 600, 600, 6, 6, 6],
  ["ذ", 700, 700, 7, 7, 24],
  ["ض", 800, 90, 8, 9, 12],
  ["ظ", 900, 800, 9, 8, 22],
  ["غ", 1000, 900, 1, 9, 5],
];

const reducedJomal = (params: number): number =>
  params
    .toString()
    .split("")
    .map((e) => parseInt(e))
    .reduce((a, b) => a + b);

const Pyro = ["اهطمفسذ"];
const Anemo = ["بوينضتظ"];
const Aqua = ["جزكصقثغ"];
const Tera = ["دحلعرخش"];

export const SquareElements = [Pyro, Anemo, Aqua, Tera];

export type CalcJomalOutput = {
  ge: number;
  gw: number;
  se: number;
  sw: number;
  n: number;
  extra: {
    reduced: {
      e: number;
      w: number;
    };
  };
};

export default function CalcJomal(input: string): CalcJomalOutput {
  let jomal = {
    ge: 0,
    gw: 0,
    le: 0,
    lw: 0,
    n: 0,
  };

  for (var i = 0, len = input.length; i < len; i++) {
    for (var j = 0; j < JummalTable.length; j++) {
      if (input[i] == JummalTable[j][0]) {
        jomal.ge = JummalTable[j][1];
        jomal.gw = JummalTable[j][2];
        jomal.le = JummalTable[j][3];
        jomal.lw = JummalTable[j][4];
        jomal.n = JummalTable[j][5];
      }
    }
  }
  return {
    ge: jomal.ge,
    gw: jomal.gw,
    se: jomal.le,
    sw: jomal.lw,
    n: jomal.n,
    extra: {
      reduced: {
        e: reducedJomal(jomal.ge),
        w: reducedJomal(jomal.gw),
      },
    },
  };
}
