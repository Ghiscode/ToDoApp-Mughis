export interface Note {
  id: string;
  text: string;
  isDone: boolean;
  imageUrl?: string;
  userId: string;
  createdAt: number;
}
