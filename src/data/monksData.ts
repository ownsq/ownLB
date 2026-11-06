export interface MonkReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  location: string;
}

export interface MonkBanaProgram {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  availableSlots?: number;
}

export interface MonkVideo {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  youtubeId: string;
  date: string;
}

export interface Monk {
  id: number;
  name: string;
  monasticTitle?: string;
  temple: string;
  loc: string;
  country: string;
  city: string;
  img: string;
  coverImg?: string;
  tags: string[];
  tradition: string;
  languages: string[];
  ordinationYear: number;
  rating: number;
  reviewsCount: number;
  programs: number;
  videos: number;
  verified: boolean;
  availableForPrograms: boolean;
  dhammaSchoolTeacher: boolean;
  onlineTeacher: boolean;
  phone: string;
  mobile: string;
  email: string;
  website: string;
  bio: string;
  aboutMe: string[];
  banaPrograms: MonkBanaProgram[];
  videoList: MonkVideo[];
  reviews: MonkReview[];
}

export const MONKS_DATA: Monk[] = [];
