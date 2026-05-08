export interface ApiBanner {
  id: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBannerCreateInput {
  /** Either `url` for a single banner or `urls` for batch insert. */
  url?: string;
  urls?: string[];
}
