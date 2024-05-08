import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type CalcJomalT = {
  id?: number;
  ayah?: string;
  ge: number;
  gw: number;
  se: number;
  sw: number;
  n: number;
};

export interface Category {
  name: string;
  subLabel: string;
  id: string;
  children?: SubCategory[];
}
export interface SubCategory {
  name: string;
  id: string;
  description?: string;
  children?: Template[];
}
export interface Template {
  name: string;
  filename: string;
  tags?: string[];
}
