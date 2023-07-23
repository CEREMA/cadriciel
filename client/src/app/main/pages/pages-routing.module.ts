import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RootComponent } from './root/root.component';
import { WorkInProgressComponent } from 'src/app/layout/work-in-progress/work-in-progress.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: RootComponent },
      {
        path: 'demo',
        component: WorkInProgressComponent,
        data: { breadcrumb: 'Profils' },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
