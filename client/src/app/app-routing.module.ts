import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginGuard } from './shared/core/guard/login.guard';
import { AccueilResolver } from './shared/core/resolver/accueil.resolver';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(
      [
        {
          path: 'login',
          loadChildren: () =>
            import('./shared/components/auth/login/login.module').then(
              (m) => m.LoginModule
            ),
        },
        {
          path: 'deconnexion',
          loadChildren: () =>
            import('./shared/components/auth/logout/logout.module').then(
              (m) => m.LogoutModule
            ),
        },
        {
          path: '',
          canActivate: [LoginGuard],
          loadChildren: () =>
            import('./layout/main.module').then((m) => m.MainModule),
          resolve: { user: AccueilResolver },
        },
        {
          path: '**',
          redirectTo: '',
        },
      ],
      { scrollPositionRestoration: 'enabled' }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
