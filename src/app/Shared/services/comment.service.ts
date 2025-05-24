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
      orderBy('timestamp', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  addComment(comment: Comment): Promise<void> {
    return addDoc(this.commentsCollection, comment).then(() => undefined);
  }
}