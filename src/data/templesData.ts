export interface Temple {
  id: string;
  name: string;
  loc: string;
  address: string;
  country: string;
  city: string;
  img: string;
  coverImg: string;
  rating: number;
  reviews: number;
  tags: string[];
  open: boolean;
  time: string;
  phone: string;
  email: string;
  website: string;
  facebook?: string;
  chiefMonk: string;
  description: string;
  history: string;
  features: string[];
  photos: string[];
  upcomingEvents: {
    title: string;
    date: string;
    time: string;
  }[];
  reviewList: {
    author: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}

export const TEMPLES_DATA: Record<string, Temple> = {};
