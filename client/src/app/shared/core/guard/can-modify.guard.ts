import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../service/user.service';
import { mergeMap } from 'rxjs/operators';
import { Roles } from '../../enums/roles.enums';

@Injectable({
  providedIn: 'root',
})
export class CanModifyGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userService.currentUser) {
      if (this.userService.userHasRole(Roles.AdminMarep) || this.userService.userHasRole(Roles.Operateur)) {
        return true;
      }
      return this.router.parseUrl('/');
    }
    return this.userService.getCurrentUser().pipe(
      mergeMap(res => {
        if (res.body) {
          this.userService.currentUser = res.body;
          if (this.userService.userHasRole(Roles.AdminMarep) || this.userService.userHasRole(Roles.Operateur)) {
            return of(true);
          }
        }
        return of(this.router.parseUrl('/'));
      })
    );
  }
}
