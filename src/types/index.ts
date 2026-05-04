export * from "./api";

export interface Money {
  amount: number;
  currency: string;
}

export interface Image {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}
