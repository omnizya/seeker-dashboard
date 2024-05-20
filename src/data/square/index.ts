enum Elementals {
  Aero,
  Tera,
  Igni,
  Aqua,
}
type Elemental = number[];
const Aero: Elemental = [6, 7, 2, 1, 5, 9, 8, 3, 4];
const Tera: Elemental = [2, 9, 4, 7, 5, 3, 6, 1, 8];
const Igni: Elemental = [6, 1, 8, 7, 5, 3, 2, 9, 4];
const Aqua: Elemental = [2, 7, 6, 9, 5, 1, 4, 3, 8];

const findIndexInArray = (n: number, a: Elemental) =>
  a.findIndex((num) => num === n);

function fillSquare(input: number, square: Elemental) {
  let outputSquare: Elemental = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < 9; index++) {
    outputSquare[findIndexInArray(index + 1, square)] = input + index;
  }
  return outputSquare;
}
console.log(fillSquare(1111, Igni));
export const Square = (Elemenetal: Elementals, Input: number) => {
  switch (Elemenetal) {
    case Elementals.Aero:
      return fillSquare(Input, Aero);
    case Elementals.Aqua:
      return fillSquare(Input, Aqua);
    case Elementals.Igni:
      return fillSquare(Input, Igni);
    case Elementals.Tera:
      return fillSquare(Input, Tera);
  }
};

console.log(Square(Elementals.Igni, 1111));
