import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from './../../core/models/comment.model';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  query, 
  where, 
  orderBy 
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly commentsCollection;

  constructor(private readonly firestore: Firestore) {
    this.commentsCollection = collection(this.firestore, 'comments');
  }

  /**
   * Fetches top-level comments for a specific apartment.
   * @param apartmentId - The ID of the apartment.
   * @returns Observable stream of comments.
   */
  getCommentsForApartment(apartmentId: string): Observable<Comment[]> {
    const q = query(
      this.commentsCollection,
      where('apartmentId', '==', apartmentId),
      where('parentCommentId', '==', null),
      orderBy('timestamp', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  /**
   * Fetches replies for a given parent comment.
   * @param parentCommentId - The ID of the parent comment.
   * @returns Observable stream of reply comments.
   */
  getRepliesForComment(parentCommentId: string): Observable<Comment[]> {
    const q = query(
      this.commentsCollection,
      where('parentCommentId', '==', parentCommentId),
      orderBy('timestamp', 'asc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  /**
   * Adds a new comment to the collection.
   * @param comment - The comment object to add.
   * @throws Error if the comment could not be added.
   */
  async addComment(comment: Comment): Promise<void> {
    try {
      await addDoc(this.commentsCollection, comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw new Error('Could not submit comment.');
    }
  }
}
