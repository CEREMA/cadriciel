import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from '../layout/main/main.component';
import { WorkInProgressComponent } from '../layout/work-in-progress/work-in-progress.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MainComponent,
        children: [
          {
            path: '',
            redirectTo: 'pages',
            pathMatch: 'full',
          },
          {
            path: 'work-in-progress',
            data: { breadcrumb: 'Work in progress' },
            component: WorkInProgressComponent,
          },
          {
            path: 'pages',
            data: { breadcrumb: 'home' },
            loadChildren: () =>
              import('./pages/pages.module').then((m) => m.HomeModule),
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MainRoutingModule {}
