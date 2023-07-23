import { Injectable } from '@angular/core';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyLocalStorageService {
  private prefix: string = environment.clientId + '_';

  getItem(key: string): string | null {
    return localStorage.getItem(this.prefix + key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  setItem(key: string, data: string): void {
    localStorage.setItem(this.prefix + key, data);
  }
}
