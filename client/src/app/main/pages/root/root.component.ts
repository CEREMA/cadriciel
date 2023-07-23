import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../../layout/service/app.layout.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit {
  constructor(private router: Router, public layoutService: LayoutService) {}

  ngOnInit(): void {}

  onBlocClick(bloc: string) {
    this.router.navigateByUrl('/home/' + bloc);
  }

  bgHover(): string {
    return this.layoutService.config.colorScheme === 'light'
      ? 'hover:bg-primary-50'
      : 'hover:bg-primary-600';
  }
}
