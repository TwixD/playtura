export interface ReadingStatus {
  user: string;
  reading: string;
  page: number;
  totalPages: number;
  percentage: number;
  pointsEarned: number;
  answers: Object;
}