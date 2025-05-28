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
  replies: { [commentId: string]: Comment[] } = {};
  newComment = '';
  replyText = '';
  replyToCommentId: string | null = null;
  user: any = null;
  errorMessage: string | null = null;

  private authSub?: Subscription;
  private commentSub?: Subscription;
  private replySubs: { [commentId: string]: Subscription } = {};

  defaultUserImageUrl = 'https://res.cloudinary.com/dzinsxvvw/image/upload/v1748085949/default-user_ehi2qk.png';

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apartmentId'] && this.apartmentId) {
      this.commentSub?.unsubscribe();
      // Unsubscribe existing reply subscriptions when apartment changes
      this.unsubscribeAllReplies();
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.commentSub?.unsubscribe();
    this.unsubscribeAllReplies();
  }

  private unsubscribeAllReplies() {
    Object.values(this.replySubs).forEach(sub => sub.unsubscribe());
    this.replySubs = {};
  }

  private loadComments(): void {
    if (!this.apartmentId) return;

    this.commentSub = this.commentService.getCommentsForApartment(this.apartmentId).subscribe(
      comments => {
        this.comments$ = of(comments);
        this.errorMessage = null;

        // Unsubscribe old reply subscriptions to avoid duplicates
        this.unsubscribeAllReplies();

        // Subscribe live to replies for each comment
        for (const comment of comments) {
          if (comment.id) {
            this.replySubs[comment.id] = this.commentService.getRepliesForComment(comment.id).subscribe(replies => {
              this.replies[comment.id!] = replies;
            });
          }
        }
      },
      error => {
        if (error instanceof Error) {
          console.error('Error loading comments:', error.message);
          this.errorMessage = error.message;
        } else {
          console.error('Unknown error loading comments:', error);
          this.errorMessage = 'Failed to load comments.';
        }
        this.comments$ = of([]);
      }
    );
  }

  async submitComment(): Promise<void> {
    this.errorMessage = null;
    if (!this.validateInput(this.newComment)) return;

    try {
      const comment = this.buildComment(this.newComment, null);
      await this.commentService.addComment(comment);
      this.newComment = '';
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage = err.message;
      } else {
        this.errorMessage = 'Failed to submit comment.';
      }
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
      // No manual reload needed: reply subscription updates replies automatically
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage = err.message;
      } else {
        this.errorMessage = 'Failed to submit reply.';
      }
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
}
