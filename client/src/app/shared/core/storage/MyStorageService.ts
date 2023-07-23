import { Injectable } from '@angular/core';
import { OAuthStorage } from 'angular-oauth2-oidc';

@Injectable()
export class MyStorageService implements OAuthStorage {
  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  setItem(key: string, data: string): void {
    sessionStorage.setItem(key, data);
  }
}
