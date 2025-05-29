import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApartmentCommentsComponent } from './apartment-comments.component';
import { CommentService } from '../../Shared/services/comment.service';
import { AuthService } from '../../Shared/services/auth.service';
import { Comment } from './../../core/models/comment.model';

describe('ApartmentCommentsComponent', () => {
  let component: ApartmentCommentsComponent;
  let fixture: ComponentFixture<ApartmentCommentsComponent>;

  // Mock user with required 'role'
  const mockUserWithRole = {
    uid: 'user1',
    email: 'user1@example.com',
    photoURL: 'https://example.com/photo.png',
    role: 'user'
  };

  // Sample comments to mock comment service responses
  const mockComments: Comment[] = [
    {
      id: 'comment1',
      apartmentId: 'apt1',
      userId: 'user1',
      username: 'user1@example.com',
      text: 'Test comment',
      // Replace jasmine.any(Object) with expect.any(Object)
      timestamp: expect.any(Object),
      userImage: 'https://example.com/photo.png',
      parentCommentId: null
    }
  ];

  let commentServiceStub: Partial<CommentService>;
  let authServiceStub: Partial<AuthService>;

  beforeEach(async () => {
    authServiceStub = {
      currentUser$: of(mockUserWithRole)
    };

    commentServiceStub = {
      // Replace jasmine.createSpy with jest.fn
      getCommentsForApartment: jest.fn().mockReturnValue(of(mockComments)),
      getRepliesForComment: jest.fn().mockReturnValue(of([])),
      addComment: jest.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      declarations: [ApartmentCommentsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: CommentService, useValue: commentServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentCommentsComponent);
    component = fixture.componentInstance;
    component.apartmentId = 'apt1'; // set input before detectChanges
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to authService.currentUser$ and set user', () => {
    expect(component.user).toEqual(mockUserWithRole);
  });

  it('should load comments and subscribe to replies when apartmentId changes', done => {
    component.ngOnChanges({
      apartmentId: {
        previousValue: null,
        currentValue: 'apt1',
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(commentServiceStub.getCommentsForApartment).toHaveBeenCalledWith('apt1');

    component.comments$.subscribe(comments => {
      expect(comments).toEqual(mockComments);
      done();
    });
  });

  it('should validate input and prevent empty or unauthenticated comments', () => {
    component.user = null;
    expect(component['validateInput']('some text')).toBe(false);
    expect(component.errorMessage).toBe('Please log in to comment.');

    component.user = mockUserWithRole;
    expect(component['validateInput']('')).toBe(false);
    expect(component.errorMessage).toBe('Comment cannot be empty.');

    expect(component['validateInput']('valid comment')).toBe(true);
  });

  it('should build comment object correctly', () => {
    component.apartmentId = 'apt1';
    component.user = mockUserWithRole;
    const comment = component['buildComment']('Hello', null);
    expect(comment.apartmentId).toBe('apt1');
    expect(comment.userId).toBe(mockUserWithRole.uid);
    expect(comment.username).toBe(mockUserWithRole.email);
    expect(comment.text).toBe('Hello');
    expect(comment.userImage).toBe(mockUserWithRole.photoURL);
    expect(comment.parentCommentId).toBeNull();
  });

  it('should call commentService.addComment on submitComment with valid input', async () => {
    component.user = mockUserWithRole;
    component.newComment = 'New test comment';

    await component.submitComment();

    expect(commentServiceStub.addComment).toHaveBeenCalled();
    expect(component.newComment).toBe('');
  });

  it('should not call addComment on submitComment if input is invalid', async () => {
    component.user = mockUserWithRole;
    component.newComment = '   '; // invalid, empty after trim

    await component.submitComment();

    expect(commentServiceStub.addComment).not.toHaveBeenCalled();
  });

  it('should toggle reply input for a comment', () => {
    component.replyToCommentId = null;
    component.toggleReply('comment1');
    expect(component.replyToCommentId).toBe('comment1');

    component.toggleReply('comment1');
    expect(component.replyToCommentId).toBeNull();
  });

  it('should submit reply and clear replyText and replyToCommentId', async () => {
    component.user = mockUserWithRole;
    component.replyText = 'Reply text';
    component.replyToCommentId = 'comment1';

    await component.submitReply('comment1');

    expect(commentServiceStub.addComment).toHaveBeenCalled();
    expect(component.replyText).toBe('');
    expect(component.replyToCommentId).toBeNull();
  });

  it('should handle errors on submitReply', async () => {
    component.user = mockUserWithRole;
    component.replyText = 'Reply error';
    component.replyToCommentId = 'comment1';

    // Replace jasmine spy with jest.fn mockRejectedValue
    (commentServiceStub.addComment as jest.Mock).mockRejectedValueOnce('Unknown error');

    await component.submitReply('comment1');

    expect(component.errorMessage).toBe('Failed to submit reply.');
  });

  afterEach(() => {
    component.ngOnDestroy();
  });
});
