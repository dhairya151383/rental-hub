import { RoleGuard } from './role.guard';
import { AuthService } from '../../Shared/services/auth.service';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceMock: Partial<AuthService>;
  let routerMock: { navigate: jest.Mock };
  let routeMock: ActivatedRouteSnapshot;

  beforeEach(() => {
  authServiceMock = {
    getCurrentUserWithRole: jest.fn()
  };

  routerMock = {
    navigate: jest.fn()
  };

  guard = new RoleGuard(authServiceMock as AuthService, routerMock as unknown as Router);

  routeMock = {
    data: { expectedRole: 'admin' }
  } as unknown as ActivatedRouteSnapshot;  // << cast here
});


  it('should allow activation if user role matches expectedRole', done => {
    (authServiceMock.getCurrentUserWithRole as jest.Mock).mockReturnValue(of({ role: 'admin' }));

    guard.canActivate(routeMock).subscribe(result => {
      expect(result).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should deny activation and navigate to /unauthorized if role does not match', done => {
    (authServiceMock.getCurrentUserWithRole as jest.Mock).mockReturnValue(of({ role: 'user' }));

    guard.canActivate(routeMock).subscribe(result => {
      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/unauthorized']);
      done();
    });
  });

  it('should deny activation and navigate to /unauthorized if user is null', done => {
    (authServiceMock.getCurrentUserWithRole as jest.Mock).mockReturnValue(of(null));

    guard.canActivate(routeMock).subscribe(result => {
      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/unauthorized']);
      done();
    });
  });

  it('should handle errors by navigating to /unauthorized and returning false', done => {
    (authServiceMock.getCurrentUserWithRole as jest.Mock).mockReturnValue(throwError(() => new Error('error')));

    guard.canActivate(routeMock).subscribe(result => {
      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/unauthorized']);
      done();
    });
  });
});
