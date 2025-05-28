import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Comment } from './../../core/models/comment.model';
import { Firestore, collection, addDoc, collectionData, query, where, orderBy, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private commentsCollection;

  constructor(private firestore: Firestore) {
    this.commentsCollection = collection(this.firestore, 'comments');
  }

  getCommentsForApartment(apartmentId: string): Observable<Comment[]> {
    const q = query(
      this.commentsCollection,
      where('apartmentId', '==', apartmentId),
      where('parentCommentId', '==', null),
      orderBy('timestamp', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  getRepliesForComment(parentCommentId: string): Observable<Comment[]> {
    const q = query(
      this.commentsCollection,
      where('parentCommentId', '==', parentCommentId),
      orderBy('timestamp', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  async addComment(comment: Comment): Promise<void> {
    try {
      await addDoc(this.commentsCollection, comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw new Error('Could not submit comment.');
    }
  }
}