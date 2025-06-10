import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth, User as FirebaseUser } from '@angular/fire/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { UserWithRole } from '../../core/models/user.model';

jest.mock('@angular/fire/auth');
jest.mock('@angular/fire/firestore');

describe('AuthService', () => {
    let service: AuthService;
    let authMock: Partial<Auth>;
    let firestoreMock: Partial<Firestore>;

    const mockUser: FirebaseUser = {
        uid: 'user123',
        email: 'test@example.com'
    } as FirebaseUser;

    const mockUserWithRole: UserWithRole = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'admin',
        displayName: 'Test User'
    };

    beforeEach(() => {
        authMock = {
            currentUser: mockUser
        };

        firestoreMock = {};

        // Mock onAuthStateChanged to immediately call callback with mockUser
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => { };
        });

        (doc as jest.Mock).mockImplementation((firestore, collection, id) => `docRef_${id}`);

        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({
                email: mockUserWithRole.email,
                role: mockUserWithRole.role,
                displayName: mockUserWithRole.displayName
            })
        });

        (setDoc as jest.Mock).mockResolvedValue(undefined);

        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
            user: mockUser
        });

        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

        (signOut as jest.Mock).mockResolvedValue({});

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: Auth, useValue: authMock },
                { provide: Firestore, useValue: firestoreMock }
            ]
        });

        service = TestBed.inject(AuthService);
    });

    it('should create service and load auth state', done => {
        service.currentUser$.subscribe(user => {
            expect(user).toEqual(mockUserWithRole);
            done();
        });
    });

    it('should register a new user and set user doc', async () => {
        await service.register('new@example.com', 'password123', 'user');

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(authMock, 'new@example.com', 'password123');
        expect(setDoc).toHaveBeenCalledWith('docRef_' + mockUser.uid, { email: 'new@example.com', role: 'user' });
    });

    it('should login successfully', async () => {
        await expect(service.login('test@example.com', 'password')).resolves.toBeUndefined();
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(authMock, 'test@example.com', 'password');
    });

    it('should throw proper error message on login failure', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code: 'auth/user-not-found' });
        await expect(service.login('wrong@example.com', 'password'))
            .rejects.toThrow('No user found with this email.');

        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code: 'auth/wrong-password' });
        await expect(service.login('test@example.com', 'wrongpass'))
            .rejects.toThrow('Incorrect password.');

        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code: 'auth/invalid-email' });
        await expect(service.login('invalid-email', 'password'))
            .rejects.toThrow('Invalid email format.');

        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code: 'auth/other-error' });
        await expect(service.login('test@example.com', 'password'))
            .rejects.toThrow('Invalid credentials');
    });

    it('should logout and clear current user', async () => {
        await service.logout();
        expect(signOut).toHaveBeenCalledWith(authMock);

        service.currentUser$.subscribe(user => {
            expect(user).toBeNull();
        });
    });

    it('should get current user with role', done => {
        service.getCurrentUserWithRole().subscribe(user => {
            expect(user).toEqual(mockUserWithRole);
            done();
        });
    });

    it('should return null if no current user when fetching user with role', done => {
        Object.defineProperty(authMock, 'currentUser', {
            get: () => null,
            configurable: true,
        });


        service.getCurrentUserWithRole().subscribe(user => {
            expect(user).toBeNull();
            done();
        });
    });

    it('should handle errors in getCurrentUserWithRole gracefully', done => {
        (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        service.getCurrentUserWithRole().subscribe(user => {
            expect(user).toBeNull();
            done();
        });
    });
});
