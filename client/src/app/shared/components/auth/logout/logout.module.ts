import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from './logout/logout.component';
import { RouterModule } from '@angular/router';
import { InplaceModule } from 'primeng/inplace';
import { RippleModule } from 'primeng/ripple';
import { SharedModule } from '../../../shared.module';
import { AppConfigModule } from '../../../../layout/config/config.module';

@NgModule({
  declarations: [LogoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: LogoutComponent,
      },
    ]),
    InplaceModule,
    RippleModule,
    AppConfigModule,
  ],
})
export class LogoutModule {}
