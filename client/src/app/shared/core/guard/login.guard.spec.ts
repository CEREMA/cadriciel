import { testBed } from '@angular/core/testing';

import { LoginGuard } from './login.guard';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HttpClienttestingModule } from '@angular/common/http/testing';

describe('LoginGuard', () => {
  let guard: LoginGuard;

  beforeEach(() => {
    testBed.configuretestingModule({
      providers: [],
      imports: [HttpClienttestingModule, OAuthModule.forRoot()],
    });
    guard = testBed.inject(LoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
