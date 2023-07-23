import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../entities/user.model';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { Claims } from '../entities/claims.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  get info() {
    const removeAt: Array<string> = [
      'at_hash',
      'aud',
      'auth_time',
      'azp',
      'email_verified',
      'exp',
      'iss',
      'iat',
      'jti',
      'nonce',
      'resource_access',
      'session_state',
      'sid',
      'sub',
      'typ',
      'adminDisplayName',
    ];
    let info: any = sessionStorage.getItem('id_token_claims_obj');

    info = JSON.parse(info);
    info.uuid = info.sub;
    for (let i = 0; i < removeAt.length; i++) delete info[removeAt[i]];
    return info;
  }
  get currentUser(): User {
    return this._currentUser;
  }

  set currentUser(value: User) {
    this._currentUser = value;
  }

  private _currentUser!: User;

  constructor(
    private httpClient: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  getCurrentUser(): Observable<HttpResponse<User>> {
    const url = '/user';
    return this.httpClient.get<User>(
      this.applicationConfigService.getEndpointFor(url),
      { observe: 'response' }
    );
  }

  userHasRole(...roles: any[]): boolean {
    return roles.some(
      (role) => this.currentUser.roleActifList.indexOf(role) >= 0
    );
  }

  addInfoFromClaims(identityClaims: Claims) {
    this._currentUser.nom = identityClaims.family_name;
    this._currentUser.prenom = identityClaims.given_name;
  }
}
