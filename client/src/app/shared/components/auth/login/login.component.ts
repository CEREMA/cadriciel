import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Subscription } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import { DOCUMENT } from '@angular/common';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  private eventSubscription: Subscription | undefined;
  canNavigate = true;

  constructor(
    private layoutService: LayoutService,
    private oauthService: OAuthService,
    private router: Router,
    private userService: UserService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.eventSubscription = this.oauthService.events.subscribe(
      async ({ type }) => {
        if (type === 'token_received' || type === 'token_refreshed') {
          this.router.navigateByUrl('/').catch((reason) => {
            this.canNavigate = false;
          });
        }
      }
    );
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
  }

  contacterAdministrateur(): void {
    console.log('récup liste admin');
  }
}
