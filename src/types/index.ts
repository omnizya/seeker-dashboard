import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type CalcJomalT = {
  east: {
    base: number;
    reduced: number;
  };
  west: {
    base: number;
    reduced: number;
  };
};
