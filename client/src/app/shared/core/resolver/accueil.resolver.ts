import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../entities/user.model';
import { UserService } from '../../service/user.service';
import { HttpResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccueilResolver implements Resolve<HttpResponse<User>> {
  constructor(private userService: UserService) {
  }

  resolve(): Observable<HttpResponse<User>> {
    return this.userService.getCurrentUser().pipe(take(1));
  }
}
