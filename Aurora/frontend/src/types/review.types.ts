export interface ReviewSubmitResult {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}