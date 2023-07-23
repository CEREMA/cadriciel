import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { AppConfigModule } from 'src/app/layout/config/config.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    AppConfigModule,
    ProgressSpinnerModule,
    ButtonModule,
    RippleModule,
  ],
  declarations: [LoginComponent],
})
export class LoginModule {}
