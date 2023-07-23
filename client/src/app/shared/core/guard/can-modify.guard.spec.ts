import { testBed } from '@angular/core/testing';

import { CanModifyGuard } from './can-modify.guard';
import { HttpClienttestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule, UrlTree } from '@angular/router';
import { UserService } from '../../service/user.service';
import { User } from '../../entities/user.model';
import { mockedUser } from '../../constants/mocks/user-mocks.constants';
import { Roles } from '../../enums/roles.enums';
import { Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

describe('CanModifyGuard', () => {
  let guard: CanModifyGuard;
  let userService: UserService;
  let mockedCurrentUser: User = { ...mockedUser };
  let router: Router;
  let route: ActivatedRoute;
  const routerStateSnapShotMock: any = {};
  let resultat: boolean | UrlTree;
  const mockUrlTree: UrlTree = new UrlTree();
  let userHasRoleSpy: jasmine.Spy;

  beforeEach(() => {
    testBed.configuretestingModule({
      imports: [HttpClienttestingModule, RouterModule.forRoot([])],
    });
    guard = testBed.inject(CanModifyGuard);
    router = testBed.inject(Router);
    userService = testBed.inject(UserService);
    route = testBed.inject(ActivatedRoute);
    spyOn(router, 'parseUrl').and.returnValue(mockUrlTree);
    userHasRoleSpy = spyOn(userService, 'userHasRole');
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to accueil with role Consultant', () => {
    mockedCurrentUser.roleActifList = [Roles.Consultant];
    spyOnProperty(userService, 'currentUser').and.returnValue(
      mockedCurrentUser
    );
    userHasRoleSpy.and.returnValue(false);

    const resultat = guard.canActivate(route.snapshot, routerStateSnapShotMock);

    expect(resultat).toBe(mockUrlTree);
  });

  it('should return true with role AdminMarep', () => {
    mockedCurrentUser.roleActifList = [Roles.AdminMarep];
    spyOnProperty(userService, 'currentUser').and.returnValue(
      mockedCurrentUser
    );
    userHasRoleSpy.withArgs(Roles.AdminMarep).and.returnValue(true);

    const resultat = guard.canActivate(route.snapshot, routerStateSnapShotMock);

    expect(resultat).toBeTrue();
  });

  it('should return true with role Operateur', () => {
    mockedCurrentUser.roleActifList = [Roles.Operateur];
    spyOnProperty(userService, 'currentUser').and.returnValue(
      mockedCurrentUser
    );
    userHasRoleSpy.withArgs(Roles.AdminMarep).and.returnValue(false);
    userHasRoleSpy.withArgs(Roles.Operateur).and.returnValue(true);

    const resultat = guard.canActivate(route.snapshot, routerStateSnapShotMock);

    expect(resultat).toBeTrue();
  });

  it('should return observable of true with no current User and role AdminMarep', () => {
    mockedCurrentUser.roleActifList = [Roles.AdminMarep];
    spyOn(userService, 'getCurrentUser').and.returnValue(
      of(new HttpResponse({ body: mockedCurrentUser }))
    );
    userHasRoleSpy.withArgs(Roles.AdminMarep).and.returnValue(true);

    const obs = guard.canActivate(
      route.snapshot,
      routerStateSnapShotMock
    ) as Observable<boolean>;

    obs.subscribe((b) => {
      resultat = b;
    });

    expect(resultat).toBeTrue();
  });

  it('should return observable of Urltree with no current User and role Consultant', () => {
    mockedCurrentUser.roleActifList = [Roles.Consultant];
    spyOn(userService, 'getCurrentUser').and.returnValue(
      of(new HttpResponse({ body: mockedCurrentUser }))
    );
    userHasRoleSpy.and.returnValue(false);

    const obs = guard.canActivate(
      route.snapshot,
      routerStateSnapShotMock
    ) as Observable<UrlTree>;

    obs.subscribe((tree) => {
      resultat = tree;
    });

    expect(resultat).toBe(mockUrlTree);
  });
});
