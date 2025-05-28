// comment.model.ts
export interface Comment {
  id?: string;
  apartmentId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: any;
  userImage?: string;
  parentCommentId?: string | null;
}
