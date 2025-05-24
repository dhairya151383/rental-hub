// src/app/apartment/apartment-comments/apartment-comments.component.ts
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { Comment } from './../../model/comment.model';
import { Timestamp } from 'firebase/firestore';
import { CommentService } from '../../Service/comment.service';
import { AuthService } from '../../Service/auth.service'; // Import AuthService
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-apartment-comments',
  standalone: false,
  templateUrl: './apartment-comments.component.html',
  styleUrls: ['./apartment-comments.component.css']
})
export class ApartmentCommentsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() apartmentId: string | null = null;
  comments$: Observable<Comment[]> = of([]);
  newComment = '';
  user: any = null;
  private authSubscription: Subscription | undefined;
  private commentsSubscription: Subscription | undefined;
  defaultUserImageUrl = 'https://res.cloudinary.com/dzinsxvvw/image/upload/v1748085949/default-user_ehi2qk.png';
  errorMessage: string | null = null;

  constructor(
    private commentService: CommentService,
    private authService: AuthService // Inject AuthService
  ) { }

  ngOnInit(): void {
    // Subscribe to the current user from AuthService
    this.authSubscription = this.authService.currentUser$.subscribe(userWithRole => {
      this.user = userWithRole; // Now 'user' might have a 'role' property
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apartmentId'] && this.apartmentId) {
      if (this.commentsSubscription) {
        this.commentsSubscription.unsubscribe();
      }
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.commentsSubscription) {
      this.commentsSubscription.unsubscribe();
    }
  }

  private loadComments(): void {
    if (this.apartmentId) {
      this.commentsSubscription = this.commentService.getCommentsForApartment(this.apartmentId).subscribe(
        comments => {
          this.comments$ = of(comments);
          this.errorMessage = null;
        },
        error => {
          console.error('Error loading comments:', error);
          this.errorMessage = 'Failed to load comments. Please try again later.';
          this.comments$ = of([]);
        }
      );
    } else {
      this.comments$ = of([]);
    }
  }

  async submitComment(): Promise<void> {
    this.errorMessage = null;

    if (!this.newComment.trim()) {
      this.errorMessage = 'Please enter a comment.';
      return;
    }

    if (!this.user) {
      this.errorMessage = 'Please log in to leave a comment.';
      return;
    }

    if (!this.apartmentId) {
      console.warn('Apartment ID not available. Cannot submit comment.');
      this.errorMessage = 'Apartment information not available. Cannot submit comment.';
      return;
    }

    const comment: Comment = {
      apartmentId: this.apartmentId,
      userId: this.user?.uid, // Use optional chaining in case user is null
      username: this.user?.email || 'Anonymous', // Or however you get the username
      text: this.newComment.trim(),
      timestamp: Timestamp.now(),
      userImage: this.user?.photoURL || this.defaultUserImageUrl
    };

    try {
      await this.commentService.addComment(comment);
      this.newComment = '';
      this.errorMessage = null;
    } catch (error) {
      console.error('Error adding comment:', error);
      this.errorMessage = 'Failed to submit comment. Please try again.';
    }
  }
}