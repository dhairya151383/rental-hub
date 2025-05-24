// src/app/Apartment/model/comment.model.ts
export interface Comment {
  id?: string;
  apartmentId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: any; // Firebase Timestamp
  userImage?: string;
}