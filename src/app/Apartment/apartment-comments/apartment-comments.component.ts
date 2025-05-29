import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { Comment } from './../../core/models/comment.model';
import { Timestamp } from 'firebase/firestore';
import { CommentService } from '../../Shared/services/comment.service';
import { AuthService } from '../../Shared/services/auth.service';

@Component({
  selector: 'app-apartment-comments',
  standalone: false,
  templateUrl: './apartment-comments.component.html',
  styleUrls: ['./apartment-comments.component.css']
})
export class ApartmentCommentsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() apartmentId: string | null = null;

  comments$: Observable<Comment[]> = of([]);
  replies: Record<string, Comment[]> = {};

  newComment = '';
  replyText = '';
  replyToCommentId: string | null = null;
  user: any = null;
  errorMessage: string | null = null;

  private authSub?: Subscription;
  private commentSub?: Subscription;
  private replySubs: Record<string, Subscription> = {};

  readonly defaultUserImageUrl = 'https://res.cloudinary.com/dzinsxvvw/image/upload/v1748085949/default-user_ehi2qk.png';

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => (this.user = user));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apartmentId'] && this.apartmentId) {
      this.unsubscribeComments();
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeComments();
    this.unsubscribeAllReplies();
    this.authSub?.unsubscribe();
  }

  private unsubscribeComments(): void {
    this.commentSub?.unsubscribe();
    this.unsubscribeAllReplies();
  }

  private unsubscribeAllReplies(): void {
    Object.values(this.replySubs).forEach(sub => sub.unsubscribe());
    this.replySubs = {};
  }

  private loadComments(): void {
    if (!this.apartmentId) return;

    this.unsubscribeComments();

    // Assign observable for async pipe
    this.comments$ = this.commentService.getCommentsForApartment(this.apartmentId);

    // Subscribe for replies and error handling
    this.commentSub = this.comments$.subscribe({
      next: comments => {
        this.errorMessage = null;
        this.unsubscribeAllReplies();

        for (const comment of comments) {
          if (comment.id) {
            this.replySubs[comment.id] = this.commentService.getRepliesForComment(comment.id)
              .subscribe(replies => (this.replies[comment.id!] = replies));
          }
        }
      },
      error: error => {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to load comments.';
        console.error('Error loading comments:', error);
        this.comments$ = of([]);
      }
    });
  }

  async submitComment(): Promise<void> {
    this.errorMessage = null;

    if (!this.validateInput(this.newComment)) return;

    try {
      const comment = this.buildComment(this.newComment, null);
      await this.commentService.addComment(comment);
      this.newComment = '';
    } catch (err: unknown) {
      this.handleError(err, 'Failed to submit comment.');
    }
  }

  async submitReply(parentCommentId: string): Promise<void> {
    this.errorMessage = null;

    if (!this.validateInput(this.replyText)) return;

    try {
      const reply = this.buildComment(this.replyText, parentCommentId);
      await this.commentService.addComment(reply);
      this.replyText = '';
      this.replyToCommentId = null;
      // Reply subscription updates automatically
    } catch (err: unknown) {
      this.handleError(err, 'Failed to submit reply.');
    }
  }

  toggleReply(commentId: string): void {
    this.replyToCommentId = this.replyToCommentId === commentId ? null : commentId;
    this.replyText = '';
  }

  private validateInput(text: string): boolean {
    if (!this.user) {
      this.errorMessage = 'Please log in to comment.';
      return false;
    }
    if (!text.trim()) {
      this.errorMessage = 'Comment cannot be empty.';
      return false;
    }
    return true;
  }

  private buildComment(text: string, parentId: string | null): Comment {
    return {
      apartmentId: this.apartmentId!,
      userId: this.user?.uid ?? 'unknown',
      username: this.user?.email ?? 'Anonymous',
      text: text.trim(),
      timestamp: Timestamp.now(),
      userImage: this.user?.photoURL || this.defaultUserImageUrl,
      parentCommentId: parentId
    };
  }

  private handleError(error: unknown, fallbackMessage: string): void {
    if (error instanceof Error) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = fallbackMessage;
    }
  }
}
